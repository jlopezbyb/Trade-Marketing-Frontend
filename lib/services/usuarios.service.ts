import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { User, Cliente } from "@/lib/types"
import { mockUsers, mockClientes } from "@/lib/mock-data"
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
    employeeCode: raw.employee_code,
  }
}

interface ClienteUsuarioAPI {
  id: string
  nombre: string
  cliente_code?: string
  direccion: string
  telefono: string
  contacto: string
  email?: string
  imagen_url?: string | null
  // Algunos backends no envían "activo" en este endpoint; lo tratamos como true por defecto
  activo?: boolean
}

function mapClienteUsuario(raw: ClienteUsuarioAPI): Cliente {
  return {
    id: raw.id,
    nombre: raw.nombre,
    direccion: raw.direccion,
    telefono: raw.telefono,
    contacto: raw.contacto,
    email: raw.email,
    imagen: raw.imagen_url ?? undefined,
    // Si el backend no manda "activo", lo consideramos activo
    activo: raw.activo ?? true,
    cliente_code: raw.cliente_code,
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
  const payload: any = {
    nombre: data.name,
    email: data.email,
    rol: data.role,
  }
  if (data.employeeCode) {
    payload.employee_code = data.employeeCode
  }
  const raw = await apiFetch<UserAPI>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
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
  const payload: any = {}
  if (data.name !== undefined) payload.nombre = data.name
  if (data.email !== undefined) payload.email = data.email
  if (data.role !== undefined) payload.rol = data.role
  if (data.employeeCode !== undefined) payload.employee_code = data.employeeCode
  if (data.activo !== undefined) payload.activo = data.activo
  const raw = await apiFetch<UserAPI>(`/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
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
  // Ver clientes asignados a un usuario: permitido para campo y supervisor
  assertPermission("clientes", "ver")
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.id === id)
    if (!user || !user.clientesAsignados || user.clientesAsignados.length === 0) {
      return []
    }
    return mockClientes.filter((c) => user.clientesAsignados?.includes(c.id))
  }

  // El backend puede devolver un arreglo plano o una respuesta paginada
  const res = await apiFetch<ClienteUsuarioAPI[] | PaginatedResponse<ClienteUsuarioAPI>>(
    `/users/${encodeURIComponent(id)}/clientes`
  )

  const items = Array.isArray(res) ? res : res.data ?? []
  return items.map(mapClienteUsuario)
}

export async function assignClientesToUsuario(id: string, clienteIds: string[]): Promise<void> {
  assertPermission("usuarios", "editar")
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx === -1) {
      throw new Error("Usuario no encontrado")
    }
    mockUsers[idx] = { ...mockUsers[idx], clientesAsignados: [...clienteIds] }
    return
  }
  return apiFetch<void>(`/users/${encodeURIComponent(id)}/clientes`, {
    method: "PUT",
    // El backend espera la clave "cliente_ids" con el array de IDs
    body: JSON.stringify({ cliente_ids: clienteIds }),
  })
}
