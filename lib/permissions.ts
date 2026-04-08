import type { UserRole } from "@/lib/types"
import { getCurrentUserRole } from "@/lib/auth-role"

export type Recurso =
  | "dashboard"
  | "inventario"
  | "clientes"
  | "productos"
  | "categorias"
  | "visitas"
  | "usuarios"
  | "reportes"

export type Accion = "ver" | "crear" | "editar" | "eliminar"

export function can(role: UserRole | null | undefined, recurso: Recurso, accion: Accion): boolean {
  if (!role) return false

  // Supervisores tienen acceso completo a todo
  if (role === "supervisor") return true

  // Reglas para agentes de campo
  switch (recurso) {
    case "dashboard":
      return accion === "ver"
    case "inventario":
      // Campo puede ver e ingresar inventario
      return accion === "ver" || accion === "crear"
    case "clientes":
      // Solo consulta de clientes
      return accion === "ver"
    case "productos":
      // Solo consulta de productos
      return accion === "ver"
    case "categorias":
      // Solo consulta de categorías
      return accion === "ver"
    case "visitas":
      // Historial (consulta) y registrar visitas (crear)
      return accion === "ver" || accion === "crear"
    case "reportes":
      // Puede ver reportes
      return accion === "ver"
    case "usuarios":
      // Sin acceso a gestión de usuarios
      return false
    default:
      return false
  }
}

export function canCurrentUser(recurso: Recurso, accion: Accion): boolean {
  return can(getCurrentUserRole(), recurso, accion)
}

export function assertPermission(recurso: Recurso, accion: Accion): void {
  if (!canCurrentUser(recurso, accion)) {
    const error = new Error("No tiene permisos para realizar esta acción.")
    ;(error as any).code = "FORBIDDEN"
    throw error
  }
}

export function isPermissionError(error: unknown): boolean {
  return Boolean((error as any)?.code === "FORBIDDEN")
}
