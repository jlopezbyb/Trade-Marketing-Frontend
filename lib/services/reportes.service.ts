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

function mapEstancado(raw: any): InventarioEstancado {
  return {
    id: raw.id,
    clienteId: raw.cliente_id,
    clienteNombre: raw.cliente_nombre ?? "",
    productoId: raw.producto_id,
    productoNombre: raw.producto_nombre ?? "",
    cantidad: raw.cantidad,
    fechaActualizacion: raw.fecha_actualizacion,
    diasSinCambio: raw.dias_sin_cambio ?? raw.dias_sin_movimiento ?? 0,
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

interface DashboardSummaryRaw {
  totalClientes?: number
  total_clientes?: number
  totalProductos?: number
  total_productos?: number
  totalVisitas?: number
  total_visitas?: number
  totalInventario?: number
  total_inventario?: number
  inventarioEstancado?: number
  inventario_estancado?: number
  productosPorVencer?: number
  productos_por_vencer?: number
}

function mapDashboardSummary(raw: DashboardSummaryRaw): DashboardSummary {
  return {
    totalClientes: raw.totalClientes ?? raw.total_clientes ?? 0,
    totalProductos: raw.totalProductos ?? raw.total_productos ?? 0,
    totalVisitas: raw.totalVisitas ?? raw.total_visitas ?? 0,
    totalInventario: raw.totalInventario ?? raw.total_inventario ?? 0,
    inventarioEstancado:
      raw.inventarioEstancado ?? raw.inventario_estancado ?? 0,
    productosPorVencer:
      raw.productosPorVencer ?? raw.productos_por_vencer ?? 0,
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
  const res = await apiFetch<DashboardSummaryRaw | { data: DashboardSummaryRaw }>("/reportes/summary")
  const raw = (res as { data?: DashboardSummaryRaw }).data ?? (res as DashboardSummaryRaw)
  return mapDashboardSummary(raw)
}
