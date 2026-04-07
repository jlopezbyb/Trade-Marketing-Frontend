import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { Cliente } from "@/lib/types"
import { mockClientes } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Mapper: snake_case del backend → camelCase del frontend
// ---------------------------------------------------------------------------

interface ClienteAPI {
  id: string
  nombre: string
  cliente_code?: string
  direccion: string
  telefono: string
  contacto: string
  email?: string
  imagen_url?: string | null
  activo: boolean
}

function mapCliente(raw: ClienteAPI): Cliente {
  return {
    id: raw.id,
    nombre: raw.nombre,
    direccion: raw.direccion,
    telefono: raw.telefono,
    contacto: raw.contacto,
    email: raw.email,
    imagen: raw.imagen_url ?? undefined,
    activo: raw.activo,
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientes(): Promise<Cliente[]> {
  if (USE_MOCK) return mockClientes
  const res = await apiFetch<PaginatedResponse<ClienteAPI>>("/clientes")
  return res.data.map(mapCliente)
}

export async function getClienteById(id: string): Promise<Cliente | undefined> {
  if (USE_MOCK) return mockClientes.find((c) => c.id === id)
  const raw = await apiFetch<ClienteAPI>(`/clientes/${encodeURIComponent(id)}`)
  return mapCliente(raw)
}

export async function createCliente(data: Omit<Cliente, "id">): Promise<Cliente> {
  if (USE_MOCK) {
    const nuevo: Cliente = { ...data, id: String(Date.now()) }
    mockClientes.push(nuevo)
    return nuevo
  }
  const raw = await apiFetch<ClienteAPI>("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapCliente(raw)
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<Cliente> {
  if (USE_MOCK) {
    const idx = mockClientes.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Cliente no encontrado")
    mockClientes[idx] = { ...mockClientes[idx], ...data }
    return mockClientes[idx]
  }
  const raw = await apiFetch<ClienteAPI>(`/clientes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return mapCliente(raw)
}

export async function deleteCliente(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockClientes.findIndex((c) => c.id === id)
    if (idx !== -1) mockClientes.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/clientes/${encodeURIComponent(id)}`, { method: "DELETE" })
}
