import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { User, Cliente } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { assertPermission } from "@/lib/permissions"

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

interface UserAPI {
  id: string
  email: string
  employee_code?: string
  nombre: string
  rol: "field" | "supervisor"
  activo: boolean
  imagen_url?: string | null
  clientes_asignados?: string[]
}

function mapUser(raw: UserAPI): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.nombre,
    role: raw.rol === "supervisor" ? "supervisor" : "field",
    activo: raw.activo,
    imagen: raw.imagen_url ?? undefined,
    clientesAsignados: raw.clientes_asignados,
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getUsuarios(): Promise<User[]> {
  assertPermission("usuarios", "ver")
  if (USE_MOCK) return mockUsers
  const res = await apiFetch<PaginatedResponse<UserAPI>>("/users")
  return res.data.map(mapUser)
}

export async function getUsuarioById(id: string): Promise<User | undefined> {
  assertPermission("usuarios", "ver")
  if (USE_MOCK) return mockUsers.find((u) => u.id === id)
  const raw = await apiFetch<UserAPI>(`/users/${encodeURIComponent(id)}`)
  return mapUser(raw)
}

export async function createUsuario(data: Omit<User, "id">): Promise<User> {
  assertPermission("usuarios", "crear")
  if (USE_MOCK) {
    const nuevo: User = { ...data, id: String(Date.now()) }
    mockUsers.push(nuevo)
    return nuevo
  }
  const raw = await apiFetch<UserAPI>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapUser(raw)
}

export async function updateUsuario(id: string, data: Partial<User>): Promise<User> {
  assertPermission("usuarios", "editar")
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error("Usuario no encontrado")
    mockUsers[idx] = { ...mockUsers[idx], ...data }
    return mockUsers[idx]
  }
  const raw = await apiFetch<UserAPI>(`/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return mapUser(raw)
}

export async function deleteUsuario(id: string): Promise<void> {
  assertPermission("usuarios", "eliminar")
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx !== -1) mockUsers.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export async function getUsuarioClientes(id: string): Promise<Cliente[]> {
  assertPermission("usuarios", "ver")
  return apiFetch<Cliente[]>(`/users/${encodeURIComponent(id)}/clientes`)
}

export async function assignClientesToUsuario(id: string, clienteIds: string[]): Promise<void> {
  assertPermission("usuarios", "editar")
  return apiFetch<void>(`/users/${encodeURIComponent(id)}/clientes`, {
    method: "PUT",
    body: JSON.stringify({ clienteIds }),
  })
}
