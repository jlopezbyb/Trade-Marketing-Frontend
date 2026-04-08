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
  loginWithEntra,
  logoutBackend,
  refreshBackendToken,
  getMe,
  setAuthToken,
  USE_MOCK,
  type AuthResponse,
} from "./api-client"
import { setCurrentUserRole } from "./auth-role"

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------
function setCookie(name: string, value: string, expires?: Date) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
  if (expires) cookie += `; expires=${expires.toUTCString()}`;
  document.cookie = cookie;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: User | null
  isLoading: boolean
  /** Indica si se está restaurando la sesión inicial */
  isRestoring: boolean
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

/** Normaliza el rol que viene del backend/JWT a nuestro union type */
function normalizeRole(raw: unknown): UserRole {
  if (!raw) return "field"
  const value = String(raw).toLowerCase()
  if (value === "supervisor") return "supervisor"
  // Cualquier otro valor lo tratamos como "field" por defecto
  return "field"
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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Estado interno para token y refresh_token, pero no se usan cookies "backendToken" ni "refreshToken"
  const [backendToken, setBackendToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [msalReady, setMsalReady] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)
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
        setAuthToken(res.token)
        // Guardar nuevos tokens en cookies unificadas
        const payload = decodeJwtPayload(res.token)
        if (payload?.exp) {
          setCookie("token", res.token, new Date(payload.exp * 1000))
        } else {
          setCookie("token", res.token)
        }
        if (res.refreshToken) {
          setCookie("refresh_token", res.refreshToken)
        }
        scheduleRefresh(res.token)
      } catch {
        // Si falla el refresh, cerrar sesión
        setUser(null)
        setBackendToken(null)
        setRefreshToken(null)
        setAuthToken(null)
        deleteCookie("token")
        deleteCookie("refresh_token")
      }
    }, expiresInMs)
  }, [])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  // ---- Almacenar tokens y obtener datos del usuario ----
  const handleAuthResponse = useCallback(
    async (res: AuthResponse) => {
      setBackendToken(res.token)
      setRefreshToken(res.refreshToken)
      setAuthToken(res.token)
      // Guardar token y refresh_token en cookies (expiración igual a la del JWT)
      const payload = decodeJwtPayload(res.token)
      if (payload?.exp) {
        setCookie("token", res.token, new Date(payload.exp * 1000))
      } else {
        setCookie("token", res.token)
      }
      if (res.refreshToken) {
        setCookie("refresh_token", res.refreshToken)
      }
      scheduleRefresh(res.token)

      try {
        const me = await getMe()
        const userObj: User = {
          id: me.id,
          email: me.email,
          name: me.name,
          role: normalizeRole(me.role),
          activo: me.activo,
          clientesAsignados: me.clientesAsignados,
          imagen: me.imagen,
        }
        setUser(userObj)
        setCurrentUserRole(userObj.role)
        // eslint-disable-next-line no-console
        console.log("[AUTH] setUser (handleAuthResponse/getMe):", userObj)
      } catch {
        // Fallback: leer datos del JWT
        const payload = decodeJwtPayload(res.token) as Record<string, unknown> | null
        const role = normalizeRole(payload?.role ?? payload?.type)
        // Debug: imprimir payload y rol detectado
        // eslint-disable-next-line no-console
        console.log("[AUTH] Payload JWT restaurado (token):", payload)
        // eslint-disable-next-line no-console
        console.log("[AUTH] Rol detectado (token):", role)
        const userObj: User = {
          id: (payload?.id as string) ?? (payload?.sub as string) ?? "",
          email: (payload?.user as string) ?? (payload?.email as string) ?? "",
          name: (payload?.nombre as string) ?? (payload?.name as string) ?? "",
          role,
          activo: true,
        }
        setUser(userObj)
        setCurrentUserRole(userObj.role)
        // eslint-disable-next-line no-console
        console.log("[AUTH] setUser (handleAuthResponse/JWT):", userObj)
      }
    },
    [scheduleRefresh]
  )
  // ---- Restaurar token desde cookie al iniciar ----
  useEffect(() => {
    let cancelled = false

    const restoreFromCookie = async () => {
      // Si ya hay token en memoria, solo marcamos que terminó la restauración
      if (backendToken) {
        setIsRestoring(false)
        return
      }

      const cookieToken = getCookie("token")
      if (!cookieToken) {
        setIsRestoring(false)
        return
      }

      const payload = decodeJwtPayload(cookieToken) as Record<string, unknown> | null
      if (!(typeof payload?.exp === "number" && payload.exp * 1000 > Date.now())) {
        deleteCookie("token")
        deleteCookie("refresh_token")
        setIsRestoring(false)
        return
      }

      setBackendToken(cookieToken)
      setAuthToken(cookieToken)
      scheduleRefresh(cookieToken)

      try {
        const me = await getMe()
        if (cancelled) return
        const userObj: User = {
          id: me.id,
          email: me.email,
          name: me.name,
          role: normalizeRole(me.role),
          activo: me.activo,
          clientesAsignados: me.clientesAsignados,
          imagen: me.imagen,
        }
        setUser(userObj)
        setCurrentUserRole(userObj.role)
        // eslint-disable-next-line no-console
        console.log("[AUTH] Sesión restaurada desde token (getMe):", userObj)
      } catch {
        if (cancelled) return
        // Fallback: leer datos del JWT
        const payloadJwt = decodeJwtPayload(cookieToken) as Record<string, unknown> | null
        const role = normalizeRole(payloadJwt?.role ?? payloadJwt?.type)
        const userObj: User = {
          id: (payloadJwt?.id as string) ?? (payloadJwt?.sub as string) ?? "",
          email: (payloadJwt?.user as string) ?? (payloadJwt?.email as string) ?? "",
          name: (payloadJwt?.nombre as string) ?? (payloadJwt?.name as string) ?? "",
          role,
          activo: true,
        }
        // eslint-disable-next-line no-console
        console.log("[AUTH] Sesión restaurada desde token (JWT):", userObj)
        setUser(userObj)
        setCurrentUserRole(userObj.role)
      } finally {
        if (!cancelled) setIsRestoring(false)
      }
    }

    restoreFromCookie()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          const mockUser: User = {
            id: response.account?.localAccountId ?? "",
            email,
            name,
            role: "supervisor",
            activo: true,
          }
          setUser(mockUser)
          setCurrentUserRole(mockUser.role)
          // eslint-disable-next-line no-console
          console.log("✅ Inicio de sesión exitoso (mock) —", name, "(", email, ")")
        } else {
          // Enviar token al backend — el rol viene del endpoint /auth/me
          loginWithEntra(entraToken)
            .then(async (res) => {
              if (cancelled) return
              await handleAuthResponse(res)
              // eslint-disable-next-line no-console
              console.log("✅ Inicio de sesión exitoso —", name, "(", email, ")")
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.error("❌ Error al autenticar con el backend:", err)
            })
        }
      }
    })

    return () => {
      cancelled = true
    }
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
          setCurrentUserRole(foundUser.role)
          setIsLoading(false)
          return true
        }
        setIsLoading(false)
        return false
      }

      // En producción solo se usa Entra ID (loginWithEntraId)
      setIsLoading(false)
      return false
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
  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    setUser(null)
    setCurrentUserRole(null)
    setBackendToken(null)
    setRefreshToken(null)
    setAuthToken(null)
    // deleteCookie("backendToken") // Ya no se usa, migrado a 'token' y 'refresh_token'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isRestoring,
        isRestoring,
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
