import { type Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser"

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? ""
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? ""
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ?? "http://localhost:3000"

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
}

/** Scopes para obtener un access token con audience = CLIENT_ID (no Graph) */
export const loginRequest = {
  scopes: [`api://${clientId}/.default`],
}

export const isMsalConfigured = (): boolean => {
  return !!(clientId && tenantId)
}

let msalInstance: PublicClientApplication | null = null

export function getMsalInstance(): PublicClientApplication | null {
  if (!isMsalConfigured()) return null
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
  }
  return msalInstance
}
