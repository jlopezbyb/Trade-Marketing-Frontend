import type { InventarioItem } from "@/features/inventario/types"

export interface InventarioEstancado extends InventarioItem {
  diasSinCambio: number
}

export interface ProductoPorVencer {
  id: string
  clienteId: string
  clienteNombre: string
  productoId: string
  productoNombre: string
  lote: string
  cantidad: number
  fechaVencimiento: string
  diasParaVencer: number
  estado: "critico" | "alerta" | "proximo"
}
