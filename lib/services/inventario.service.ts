import type { InventarioItem, InventarioEstancado, ProductoPorVencer } from "@/lib/types"
import { mockInventarioActual, mockInventarioEstancado, mockProductosPorVencer } from "@/lib/mock-data"

export async function getInventarioActual(): Promise<InventarioItem[]> {
  // TODO: reemplazar con GET /api/v1/inventario
  return mockInventarioActual
}

export async function getInventarioEstancado(): Promise<InventarioEstancado[]> {
  // TODO: reemplazar con GET /api/v1/reportes/estancado
  return mockInventarioEstancado
}

export async function getProductosPorVencer(): Promise<ProductoPorVencer[]> {
  // TODO: reemplazar con GET /api/v1/reportes/por-vencer
  return mockProductosPorVencer
}
