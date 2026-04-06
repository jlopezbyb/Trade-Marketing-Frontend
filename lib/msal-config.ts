import { type Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser"

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? ""
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? ""
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ?? ""

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    // localStorage para que popup y ventana principal compartan cache
    cacheLocation: "localStorage",
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
}

/**
 * Scopes para login.
 * Se usa openid/profile/email porque el Application ID URI (api://{clientId})
 * puede no estar configurado en Azure Portal.
 * El backend valida el idToken recibido desde el frontend.
 */
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
}

export const isMsalConfigured = (): boolean => {
  return !!(clientId && tenantId)
}

let msalInstance: PublicClientApplication | null = null

/**
 * Promise que se resuelve con el resultado de handleRedirectPromise.
 * Se ejecuta a nivel de módulo (antes de React) para capturar el #code=
 * cuando Microsoft redirige de vuelta después del login.
 */
export let msalRedirectResult: Promise<import("@azure/msal-browser").AuthenticationResult | null> | null = null

export function getMsalInstance(): PublicClientApplication | null {
  if (typeof window === "undefined") return null
  if (!isMsalConfigured()) return null
  if (!msalInstance) {
    try {
      msalInstance = new PublicClientApplication(msalConfig)
    } catch {
      return null
    }
  }
  return msalInstance
}

// Inicialización a nivel de módulo (antes de React)
if (typeof window !== "undefined" && isMsalConfigured()) {
  const inst = getMsalInstance()
  if (inst) {
    msalRedirectResult = inst
      .initialize()
      .then(() => inst.handleRedirectPromise())
      .catch(() => null)
  }
}
