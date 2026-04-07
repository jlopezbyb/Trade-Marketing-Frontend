const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3500/api/v1"

export const USE_MOCK = !process.env.NEXT_PUBLIC_API_BASE_URL

// ---------------------------------------------------------------------------
// Token management (module-level para que los servicios lo usen automáticamente)
// ---------------------------------------------------------------------------

let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

export function getAuthToken(): string | null {
  return _authToken
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (_authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${_authToken}`)
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "")
    throw new Error(errorBody || res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Respuesta paginada del backend */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

/** Respuesta de los endpoints de login */
export interface AuthResponse {
  message: string
  token: string
  refreshToken: string
}

/** Respuesta cruda del endpoint /auth/me (snake_case del backend) */
interface MeRawResponse {
  id: string
  email: string
  nombre: string
  rol: "field" | "supervisor"
  activo: boolean
  imagen_url?: string | null
  clientes_asignados?: string[]
}

/** Respuesta mapeada del endpoint /auth/me */
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

/** Login con token de Entra ID — POST /auth/login */
export async function loginWithEntra(entraAccessToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { Authorization: `Bearer ${entraAccessToken}` },
  })
}

/** Obtener usuario autenticado — GET /auth/me */
export async function getMe(): Promise<MeResponse> {
  const raw = await apiFetch<MeRawResponse>("/auth/me")
  return {
    id: raw.id,
    email: raw.email,
    name: raw.nombre,
    role: raw.rol === "supervisor" ? "supervisor" : "field",
    activo: raw.activo,
    clientesAsignados: raw.clientes_asignados,
    imagen: raw.imagen_url ?? undefined,
  }
}

/** Refrescar token — POST /auth/refresh-token */
export async function refreshBackendToken(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/refresh-token", { method: "POST" })
}

/** Cerrar sesión — POST /auth/logout */
export async function logoutBackend(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" })
}

/** Health check — GET /health */
export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health")
}
