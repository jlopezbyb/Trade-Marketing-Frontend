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
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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

type SessionWarningReason = "idle" | "token"

interface SessionWarningState {
  reason: SessionWarningReason
}

// Valores por defecto (en milisegundos / segundos)
const DEFAULT_IDLE_TIMEOUT_MS = 60_000
const DEFAULT_EXPIRY_WARNING_MS = 60_000
const DEFAULT_SESSION_COUNTDOWN_SECONDS = 30

// Permite parametrizar tiempos desde variables de entorno NEXT_PUBLIC_...
const IDLE_TIMEOUT_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDLE_TIMEOUT_MS
})()

const EXPIRY_WARNING_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_SESSION_EXPIRY_WARNING_MS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXPIRY_WARNING_MS
})()

const SESSION_COUNTDOWN_SECONDS = (() => {
  const raw = process.env.NEXT_PUBLIC_SESSION_COUNTDOWN_SECONDS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_COUNTDOWN_SECONDS
})()

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
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [sessionWarning, setSessionWarning] = useState<SessionWarningState | null>(null)
  const [countdown, setCountdown] = useState<number>(0)

  const msalEnabled = isMsalConfigured()
  const hasProcessedRedirectRef = useRef(false)

  // ---- Logout centralizado (manual o por timeout) ----
  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    refreshTimerRef.current = null
    idleTimerRef.current = null
    countdownIntervalRef.current = null

    setSessionWarning(null)
    setCountdown(0)

    setUser(null)
    setCurrentUserRole(null)
    setBackendToken(null)
    setRefreshToken(null)
    setAuthToken(null)

    deleteCookie("token")
    deleteCookie("refresh_token")

    // Intentar cerrar sesion tambien en el backend; ignorar errores en modo mock
    void logoutBackend().catch(() => {})
  }, [])

  // ---- Dialogo global de "¿Sigues allí?" ----
  const openSessionWarning = useCallback(
    (reason: SessionWarningReason) => {
      if (!user) return
      // Si ya hay un aviso mostrado, no volver a reiniciar el contador
      if (sessionWarning) return

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }

      setSessionWarning({ reason })
      setCountdown(SESSION_COUNTDOWN_SECONDS)

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }
            logout()
            return 0
          }
          return prev - 1
        })
      }, 1_000)
    },
    [logout, sessionWarning, user]
  )

  // ---- Programar aviso de expiracion del token del backend ----
  const scheduleRefresh = useCallback(
    (token: string) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }

      const payload = decodeJwtPayload(token)
      if (!payload?.exp) return

      // Mostrar aviso EXPIRY_WARNING_MS antes de que expire el token
      const warningInMs = payload.exp * 1000 - Date.now() - EXPIRY_WARNING_MS

      if (warningInMs <= 0) {
        openSessionWarning("token")
        return
      }

      refreshTimerRef.current = setTimeout(() => {
        openSessionWarning("token")
      }, warningInMs)
    },
    [openSessionWarning]
  )

  // ---- Refrescar token de sesion bajo demanda (boton "Si") ----
  const refreshSessionToken = useCallback(async (): Promise<boolean> => {
    if (!backendToken) return false

    try {
      const res = await refreshBackendToken()
      setBackendToken(res.token)
      setRefreshToken(res.refreshToken)
      setAuthToken(res.token)

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
      return true
    } catch {
      logout()
      return false
    }
  }, [backendToken, logout, scheduleRefresh])

  // ---- Timer de inactividad (1 minuto sin interaccion) ----
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    if (!user) return

    idleTimerRef.current = setTimeout(() => {
      openSessionWarning("idle")
    }, IDLE_TIMEOUT_MS)
  }, [openSessionWarning, user])

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
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
        // Evitar procesar el mismo redirect varias veces (lo que generaría
        // múltiples llamadas a /auth/login en el backend)
        if (hasProcessedRedirectRef.current) {
          return
        }
        hasProcessedRedirectRef.current = true

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

  // ---- Escuchar token inválido desde el backend ----
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleTokenInvalid = () => {
      toast.info("Tu sesión ha expirado o el token es inválido. Por favor inicia sesión nuevamente.")
      logout()
    }

    window.addEventListener("auth:token-invalid", handleTokenInvalid as EventListener)

    return () => {
      window.removeEventListener("auth:token-invalid", handleTokenInvalid as EventListener)
    }
  }, [logout])
  // ---- Escuchar actividad del usuario para reiniciar el timer de inactividad ----
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!user) return

    const events: (keyof WindowEventMap)[] = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ]

    const handleActivity = () => {
      if (!sessionWarning) {
        resetIdleTimer()
      }
    }

    events.forEach((event) => window.addEventListener(event, handleActivity))
    resetIdleTimer()

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [resetIdleTimer, sessionWarning, user])

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

      <AlertDialog open={!!sessionWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sigues allí?</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionWarning?.reason === "token"
                ? "Tu sesión está a punto de expirar. Por seguridad, confirma si deseas seguir usando el sistema."
                : "Detectamos inactividad en la aplicación. Para mantener tu sesión activa, confirma que sigues utilizando el sistema."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>La sesión se cerrará automáticamente en</span>
              <span className="font-mono text-base text-gold">{countdown}s</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gold transition-[width] duration-1000 ease-linear"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (countdown / (SESSION_COUNTDOWN_SECONDS || DEFAULT_SESSION_COUNTDOWN_SECONDS)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={async () => {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current)
                  countdownIntervalRef.current = null
                }

                const reason = sessionWarning?.reason
                setSessionWarning(null)
                setCountdown(0)

                if (reason === "token" || reason === "idle") {
                  // Siempre que sea posible, intenta refrescar el token
                  await refreshSessionToken()
                }

                resetIdleTimer()
              }}
            >
              Sí, seguir en la aplicación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
