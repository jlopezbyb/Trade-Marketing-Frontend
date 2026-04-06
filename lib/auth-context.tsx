"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import {
  EventType,
  InteractionStatus,
  type AuthenticationResult,
} from "@azure/msal-browser"
import type { User, UserRole } from "./types"
import { mockUsers } from "./mock-data"
import { getMsalInstance, isMsalConfigured, loginRequest } from "./msal-config"
import {
  loginLocal,
  loginEntraAdmin,
  loginEntraEmployee,
  logoutBackend,
  refreshBackendToken,
  type AuthResponse,
} from "./api-client"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EntraLoginRole = "admin" | "employee"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  /** Login con credenciales locales (admin) — mock en dev, API en prod */
  login: (email: string, password: string) => Promise<boolean>
  /** Login con Microsoft Entra ID (popup). role determina el endpoint del backend. */
  loginWithEntraId: (role?: EntraLoginRole) => Promise<boolean>
  logout: () => void
  /** Token JWT del backend para llamadas autenticadas */
  backendToken: string | null
  /** Indica si MSAL está configurado (variables de entorno presentes) */
  isMsalEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decodifica payload de un JWT sin verificar firma (solo para leer exp) */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split(".")[1]
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Mapea la respuesta del backend a la interfaz User del dominio */
function mapAuthResponseToUser(authRes: AuthResponse, email: string, name: string): User {
  // TODO: cuando el backend devuelva los datos del usuario en la respuesta,
  // usarlos directamente en lugar de inferir aquí.
  const payload = decodeJwtPayload(authRes.token)
  return {
    id: (payload as Record<string, unknown>)?.sub as string ?? "",
    email,
    name,
    role: "field" as UserRole, // se ajustará con endpoint /me
    activo: true,
  }
}

// ---------------------------------------------------------------------------
// Mock passwords (desarrollo — se usa cuando el backend aún no está conectado)
// ---------------------------------------------------------------------------

const mockPasswords: Record<string, string> = {
  "campo@byb.com": "demo123",
  "supervisor@byb.com": "demo123",
  "campo2@byb.com": "demo123",
  "campo3@byb.com": "demo123",
}

const USE_MOCK = !process.env.NEXT_PUBLIC_API_BASE_URL

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [backendToken, setBackendToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [msalReady, setMsalReady] = useState(false)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const msalEnabled = isMsalConfigured()

  // ---- Programar refresh automático del token del backend ----
  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return

    // Refrescar 60s antes de que expire
    const expiresInMs = payload.exp * 1000 - Date.now() - 60_000
    if (expiresInMs <= 0) return

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await refreshBackendToken()
        setBackendToken(res.token)
        setRefreshToken(res.refreshToken)
        scheduleRefresh(res.token)
      } catch {
        // Si falla el refresh, cerrar sesión
        setUser(null)
        setBackendToken(null)
        setRefreshToken(null)
      }
    }, expiresInMs)
  }, [])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  // ---- Inicializar MSAL ----
  useEffect(() => {
    if (!msalEnabled) return

    const instance = getMsalInstance()
    if (!instance) return

    instance.initialize().then(() => {
      instance.handleRedirectPromise()
      setMsalReady(true)
    })
  }, [msalEnabled])

  // ---- Almacenar tokens del backend ----
  const handleAuthResponse = useCallback(
    (res: AuthResponse, email: string, name: string) => {
      const mappedUser = mapAuthResponseToUser(res, email, name)
      setUser(mappedUser)
      setBackendToken(res.token)
      setRefreshToken(res.refreshToken)
      scheduleRefresh(res.token)
    },
    [scheduleRefresh]
  )

  // ---- Login local (credenciales) ----
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true)

      // Mock para desarrollo sin backend
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const foundUser = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.activo
        )
        const expectedPassword = mockPasswords[email.toLowerCase()]
        if (foundUser && expectedPassword === password) {
          setUser(foundUser)
          setIsLoading(false)
          return true
        }
        setIsLoading(false)
        return false
      }

      // Producción: POST /api/v1/auth/login
      try {
        const res = await loginLocal(email, password)
        handleAuthResponse(res, email, email)
        setIsLoading(false)
        return true
      } catch {
        setIsLoading(false)
        return false
      }
    },
    [handleAuthResponse]
  )

  // ---- Login con Entra ID (popup → backend) ----
  const loginWithEntraId = useCallback(
    async (role: EntraLoginRole = "employee"): Promise<boolean> => {
      const instance = getMsalInstance()
      if (!instance || !msalReady) return false

      setIsLoading(true)
      try {
        // 1. Popup de Microsoft → obtener access token de Entra ID
        const msalResponse = await instance.loginPopup(loginRequest)
        instance.setActiveAccount(msalResponse.account)

        const entraAccessToken = msalResponse.accessToken
        const email = msalResponse.account?.username ?? ""
        const name = msalResponse.account?.name ?? email

        // Si no hay backend configurado, solo usar info de MSAL (modo mock)
        if (USE_MOCK) {
          setUser({
            id: msalResponse.account?.localAccountId ?? "",
            email,
            name,
            role: role === "admin" ? "supervisor" : "field",
            activo: true,
          })
          setIsLoading(false)
          return true
        }

        // 2. Enviar el access token al backend correspondiente
        const backendLogin = role === "admin" ? loginEntraAdmin : loginEntraEmployee
        const res = await backendLogin(entraAccessToken)

        // 3. Almacenar tokens del backend
        handleAuthResponse(res, email, name)
        setIsLoading(false)
        return true
      } catch {
        setIsLoading(false)
        return false
      }
    },
    [msalReady, handleAuthResponse]
  )

  // ---- Obtener token silencioso (para renovar el access token de Entra) ----
  const acquireToken = useCallback(async (): Promise<string | null> => {
    const instance = getMsalInstance()
    if (!instance) return null

    const account = instance.getActiveAccount()
    if (!account) return null

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      })
      return response.accessToken
    } catch {
      try {
        const response = await instance.acquireTokenPopup(loginRequest)
        return response.accessToken
      } catch {
        return null
      }
    }
  }, [])

  // ---- Logout ----
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    // Logout en el backend
    if (!USE_MOCK && backendToken) {
      try {
        await logoutBackend()
      } catch {
        // Continuar con el logout local aunque el backend falle
      }
    }

    // Logout de MSAL
    const instance = getMsalInstance()
    if (instance && instance.getActiveAccount()) {
      try {
        await instance.logoutPopup()
      } catch {
        // Continuar
      }
    }

    setUser(null)
    setBackendToken(null)
    setRefreshToken(null)
  }, [backendToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithEntraId,
        logout,
        backendToken,
        isMsalEnabled: msalEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
