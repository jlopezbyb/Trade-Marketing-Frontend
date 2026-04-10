export type UserRole = "field" | "supervisor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  activo: boolean
  clientesAsignados?: string[]
  imagen?: string
  employeeCode?: string
}
