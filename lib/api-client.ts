const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3500/api/v1"

/** Respuesta de los endpoints de login */
export interface AuthResponse {
  message: string
  token: string
  refreshToken: string
}

/** Respuesta del usuario autenticado */
export interface MeResponse {
  id: string
  email: string
  name: string
  role: "field" | "supervisor"
  activo: boolean
  clientesAsignados?: string[]
  imagen?: string
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/** Login admin con credenciales locales */
export async function loginLocal(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error("Credenciales incorrectas")
  return res.json()
}

/** Login admin con token de Entra ID */
export async function loginEntraAdmin(entraAccessToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/entra/login`, {
    method: "POST",
    headers: { Authorization: `Bearer ${entraAccessToken}` },
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error al autenticar con Entra ID (admin)")
  return res.json()
}

/** Login empleado con token de Entra ID */
export async function loginEntraEmployee(entraAccessToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/employee/entra/login`, {
    method: "POST",
    headers: { Authorization: `Bearer ${entraAccessToken}` },
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error al autenticar con Entra ID (empleado)")
  return res.json()
}

/** Refresh del token del backend */
export async function refreshBackendToken(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) throw new Error("No se pudo refrescar el token")
  return res.json()
}

/** Logout en el backend */
export async function logoutBackend(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

// ---------------------------------------------------------------------------
// Helper para requests autenticados
// ---------------------------------------------------------------------------

export function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}
