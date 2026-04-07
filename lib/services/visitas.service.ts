import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { Visita } from "@/lib/types"
import { mockVisitas } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

interface VisitaAPI {
  id: string
  cliente_id: string
  cliente_nombre?: string
  fecha: string
  observaciones: string
  usuario_id: string
}

function mapVisita(raw: VisitaAPI): Visita {
  return {
    id: raw.id,
    clienteId: raw.cliente_id,
    clienteNombre: raw.cliente_nombre ?? "",
    fecha: raw.fecha,
    observaciones: raw.observaciones,
    usuarioId: raw.usuario_id,
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getVisitas(): Promise<Visita[]> {
  if (USE_MOCK) return mockVisitas
  const res = await apiFetch<PaginatedResponse<VisitaAPI>>("/visitas")
  return res.data.map(mapVisita)
}

export async function getVisitasByUsuario(usuarioId: string): Promise<Visita[]> {
  if (USE_MOCK) return mockVisitas.filter((v) => v.usuarioId === usuarioId)
  const res = await apiFetch<PaginatedResponse<VisitaAPI>>(`/visitas?usuarioId=${encodeURIComponent(usuarioId)}`)
  return res.data.map(mapVisita)
}

export async function createVisita(data: Omit<Visita, "id">): Promise<Visita> {
  if (USE_MOCK) {
    const nueva: Visita = { ...data, id: String(Date.now()) }
    mockVisitas.push(nueva)
    return nueva
  }
  const raw = await apiFetch<VisitaAPI>("/visitas", {
    method: "POST",
    body: JSON.stringify({
      cliente_id: Number(data.clienteId),
      cliente_nombre: data.clienteNombre,
      fecha: data.fecha,
      observaciones: data.observaciones,
      usuario_id: Number(data.usuarioId),
    }),
  })
  return mapVisita(raw)
}

export async function updateVisita(id: string, data: Partial<Visita>): Promise<Visita> {
  if (USE_MOCK) {
    const idx = mockVisitas.findIndex((v) => v.id === id)
    if (idx === -1) throw new Error("Visita no encontrada")
    mockVisitas[idx] = { ...mockVisitas[idx], ...data }
    return mockVisitas[idx]
  }
  const raw = await apiFetch<VisitaAPI>(`/visitas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return mapVisita(raw)
}

export async function deleteVisita(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockVisitas.findIndex((v) => v.id === id)
    if (idx !== -1) mockVisitas.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/visitas/${encodeURIComponent(id)}`, { method: "DELETE" })
}
