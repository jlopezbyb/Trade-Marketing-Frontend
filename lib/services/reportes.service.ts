import { apiFetch, USE_MOCK } from "@/lib/api-client"
import type { InventarioEstancado, ProductoPorVencer, DashboardSummary } from "@/lib/types"
import { mockInventarioEstancado, mockProductosPorVencer } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

interface EstancadoAPI {
  id: string
  cliente_id: string
  cliente_nombre?: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
  fecha_actualizacion: string
  dias_sin_cambio: number
}

function mapEstancado(raw: EstancadoAPI): InventarioEstancado {
  return {
    id: raw.id,
    clienteId: raw.cliente_id,
    clienteNombre: raw.cliente_nombre ?? "",
    productoId: raw.producto_id,
    productoNombre: raw.producto_nombre ?? "",
    cantidad: raw.cantidad,
    fechaActualizacion: raw.fecha_actualizacion,
    diasSinCambio: raw.dias_sin_cambio,
  }
}

interface PorVencerAPI {
  id: string
  cliente_id: string
  cliente_nombre?: string
  producto_id: string
  producto_nombre?: string
  lote: string
  cantidad: number
  fecha_vencimiento: string
  dias_para_vencer: number
  estado: "critico" | "alerta" | "proximo"
}

function mapPorVencer(raw: PorVencerAPI): ProductoPorVencer {
  return {
    id: raw.id,
    clienteId: raw.cliente_id,
    clienteNombre: raw.cliente_nombre ?? "",
    productoId: raw.producto_id,
    productoNombre: raw.producto_nombre ?? "",
    lote: raw.lote,
    cantidad: raw.cantidad,
    fechaVencimiento: raw.fecha_vencimiento,
    diasParaVencer: raw.dias_para_vencer,
    estado: raw.estado,
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getInventarioEstancado(): Promise<InventarioEstancado[]> {
  if (USE_MOCK) return mockInventarioEstancado
  const res = await apiFetch<EstancadoAPI[]>("/reportes/inventario-estancado")
  return (Array.isArray(res) ? res : (res as { data: EstancadoAPI[] }).data).map(mapEstancado)
}

export async function getProductosPorVencer(): Promise<ProductoPorVencer[]> {
  if (USE_MOCK) return mockProductosPorVencer
  const res = await apiFetch<PorVencerAPI[]>("/reportes/productos-por-vencer")
  return (Array.isArray(res) ? res : (res as { data: PorVencerAPI[] }).data).map(mapPorVencer)
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/reportes/summary")
}
