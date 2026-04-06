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
import { getMsalInstance, isMsalConfigured, loginRequest, msalRedirectResult } from "./msal-config"
import {
  loginLocal,
  loginEntraAdmin,
  logoutBackend,
  refreshBackendToken,
  type AuthResponse,
} from "./api-client"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: User | null
  isLoading: boolean
  /** Login con credenciales locales (admin) — mock en dev, API en prod */
  login: (email: string, password: string) => Promise<boolean>
  /** Login con Microsoft Entra ID (redirect). El rol se determina por el JWT del backend. */
  loginWithEntraId: () => Promise<boolean>
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
  const payload = decodeJwtPayload(authRes.token) as Record<string, unknown> | null
  const tokenRole = payload?.role as string | undefined
  return {
    id: (payload?.sub as string) ?? "",
    email,
    name,
    role: tokenRole === "supervisor" ? "supervisor" : "field",
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

  // ---- Inicializar MSAL y procesar redirect ----
  useEffect(() => {
    if (!msalEnabled || !msalRedirectResult) return

    let cancelled = false
    msalRedirectResult.then((response) => {
      if (cancelled) return
      setMsalReady(true)

      // Si hay respuesta, es que venimos de un redirect de Microsoft
      if (response) {
        const instance = getMsalInstance()
        instance?.setActiveAccount(response.account)

        const entraToken = response.idToken || response.accessToken
        const email = response.account?.username ?? ""
        const name = response.account?.name ?? email

        if (USE_MOCK) {
          setUser({
            id: response.account?.localAccountId ?? "",
            email,
            name,
            role: "supervisor",
            activo: true,
          })
          console.log("✅ Inicio de sesión exitoso (mock) —", name, "(", email, ")")
        } else {
          // Enviar token al backend — el rol viene en el JWT de respuesta
          loginEntraAdmin(entraToken).then((res) => {
            if (cancelled) return
            handleAuthResponse(res, email, name)
            console.log("✅ Inicio de sesión exitoso —", name, "(", email, ")")
          }).catch((err) => {
            console.error("❌ Error al autenticar con el backend:", err)
          })
        }
      }
    })

    return () => { cancelled = true }
  }, [msalEnabled, handleAuthResponse])

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

  // ---- Login con Entra ID (redirect) ----
  const loginWithEntraId = useCallback(
    async (): Promise<boolean> => {
      const instance = getMsalInstance()
      if (!instance || !msalReady) return false

      try {
        // Redirige toda la página a Microsoft. Al volver,
        // handleRedirectPromise (nivel de módulo) procesa el código.
        await instance.loginRedirect(loginRequest)
        // No retorna — el navegador navega a Microsoft
        return true
      } catch (err) {
        console.error("❌ Error en inicio de sesión:", err)
        return false
      }
    },
    [msalReady]
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

    setUser(null)
    setBackendToken(null)
    setRefreshToken(null)

    // Logout de MSAL (redirect — limpia sesión en Microsoft)
    const instance = getMsalInstance()
    if (instance && instance.getActiveAccount()) {
      try {
        await instance.logoutRedirect()
      } catch {
        // Continuar
      }
    }
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
