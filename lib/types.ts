export type UserRole = "field" | "supervisor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  activo: boolean
  clientesAsignados?: string[] // IDs de clientes asignados
  imagen?: string
}

export interface Cliente {
  id: string
  nombre: string
  direccion: string
  telefono: string
  contacto: string
  email?: string
  imagen?: string
  activo: boolean
}

export interface Visita {
  id: string
  clienteId: string
  clienteNombre: string
  fecha: string
  observaciones: string
  usuarioId: string
}

export interface Producto {
  id: string
  nombre: string
  sku: string
  unidad: string
  imagen?: string
  categoria?: string
  activo: boolean
}

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

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  color: string
  activo: boolean
}

export interface DashboardSummary {
  totalClientes: number
  totalProductos: number
  totalVisitas: number
  totalInventario: number
  inventarioEstancado: number
  productosPorVencer: number
}
