import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { Cliente } from "@/lib/types"
import { mockClientes } from "@/lib/mock-data"
import { assertPermission } from "@/lib/permissions"

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
    cliente_code: raw.cliente_code,
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


export async function createCliente(data: FormData): Promise<Cliente> {
  assertPermission("clientes", "crear")
  const raw = await apiFetch<ClienteAPI>("/clientes", {
    method: "POST",
    body: data,
  })
  return mapCliente(raw)
}


export async function updateCliente(id: string, data: FormData): Promise<Cliente> {
  assertPermission("clientes", "editar")
  const raw = await apiFetch<ClienteAPI>(`/clientes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: data,
  })
  return mapCliente(raw)
}
// Helper para construir la URL absoluta de imagen
export function getImageUrl(imagen: string | undefined) {
  if (!imagen) return ""
  if (imagen.startsWith("http")) return imagen
  // Obtener la base URL del backend de variable de entorno pública
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1$/, "") || ""
  if (imagen.startsWith("/uploads")) return `${baseUrl}${imagen}`
  return imagen
}

export async function deleteCliente(id: string): Promise<void> {
  assertPermission("clientes", "eliminar")
  if (USE_MOCK) {
    const idx = mockClientes.findIndex((c) => c.id === id)
    if (idx !== -1) mockClientes.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/clientes/${encodeURIComponent(id)}`, { method: "DELETE" })
}
