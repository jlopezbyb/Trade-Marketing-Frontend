export interface LoteInventario {
  id: string
  lote: string
  cantidad: number
  fechaVencimiento: string
}

export interface InventarioItem {
  id: string
  clienteId: string
  clienteNombre: string
  productoId: string
  productoNombre: string
  cantidad: number
  fechaActualizacion: string
  lotes?: LoteInventario[]
}
