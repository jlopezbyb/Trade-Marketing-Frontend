// Barrel re-exports — cada feature define sus propios tipos
export type { User, UserRole } from "@/features/usuarios/types"
export type { Cliente } from "@/features/clientes/types"
export type { Producto } from "@/features/productos/types"
export type { Visita } from "@/features/visitas/types"
export type { Categoria } from "@/features/categorias/types"
export type { LoteInventario, InventarioItem } from "@/features/inventario/types"
export type { InventarioEstancado, ProductoPorVencer } from "@/features/reportes/types"
export type { DashboardSummary } from "@/features/dashboard/types"
