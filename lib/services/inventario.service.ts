import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { InventarioItem } from "@/lib/types"
import { mockInventarioActual } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

interface InventarioAPI {
  id: string
  cliente_id: string
  cliente_nombre?: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
  fecha_actualizacion: string
  lotes?: { id: string; lote: string; cantidad: number; fecha_vencimiento: string }[]
}

function mapInventario(raw: InventarioAPI): InventarioItem {
  return {
    id: raw.id,
    clienteId: raw.cliente_id,
    clienteNombre: raw.cliente_nombre ?? "",
    productoId: raw.producto_id,
    productoNombre: raw.producto_nombre ?? "",
    cantidad: raw.cantidad,
    fechaActualizacion: raw.fecha_actualizacion,
    lotes: raw.lotes?.map((l) => ({
      id: l.id,
      lote: l.lote,
      cantidad: l.cantidad,
      fechaVencimiento: l.fecha_vencimiento,
    })),
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getInventarioActual(): Promise<InventarioItem[]> {
  if (USE_MOCK) return mockInventarioActual
  const res = await apiFetch<PaginatedResponse<InventarioAPI>>("/inventario")
  return res.data.map(mapInventario)
}

export async function createInventario(data: Omit<InventarioItem, "id">): Promise<InventarioItem> {
  if (USE_MOCK) {
    const nuevo: InventarioItem = { ...data, id: String(Date.now()) }
    mockInventarioActual.push(nuevo)
    return nuevo
  }
  const raw = await apiFetch<InventarioAPI>("/inventario", {
    method: "POST",
    body: JSON.stringify({
      cliente_id: data.clienteId,
      producto_id: data.productoId,
      cantidad: data.cantidad,
      fecha_actualizacion: data.fechaActualizacion,
      lotes: data.lotes?.map((l) => ({
        lote: l.lote,
        cantidad: l.cantidad,
        fecha_vencimiento: l.fechaVencimiento,
      })),
    }),
  })
  return mapInventario(raw)
}

export async function updateInventario(id: string, data: Partial<InventarioItem>): Promise<InventarioItem> {
  if (USE_MOCK) {
    const idx = mockInventarioActual.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error("Registro de inventario no encontrado")
    mockInventarioActual[idx] = { ...mockInventarioActual[idx], ...data }
    return mockInventarioActual[idx]
  }
  const raw = await apiFetch<InventarioAPI>(`/inventario/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return mapInventario(raw)
}

export async function deleteInventario(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockInventarioActual.findIndex((i) => i.id === id)
    if (idx !== -1) mockInventarioActual.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/inventario/${encodeURIComponent(id)}`, { method: "DELETE" })
}
