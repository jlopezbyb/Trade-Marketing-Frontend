import type { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

export async function getUsuarios(): Promise<User[]> {
  // TODO: reemplazar con GET /api/v1/usuarios
  return mockUsers
}

export async function getUsuarioById(id: string): Promise<User | undefined> {
  // TODO: reemplazar con GET /api/v1/usuarios/:id
  return mockUsers.find((u) => u.id === id)
}

export async function createUsuario(data: Omit<User, "id">): Promise<User> {
  // TODO: reemplazar con POST /api/v1/usuarios
  const nuevo: User = { ...data, id: String(Date.now()) }
  mockUsers.push(nuevo)
  return nuevo
}

export async function updateUsuario(id: string, data: Partial<User>): Promise<User> {
  // TODO: reemplazar con PUT /api/v1/usuarios/:id
  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error("Usuario no encontrado")
  mockUsers[idx] = { ...mockUsers[idx], ...data }
  return mockUsers[idx]
}

export async function deleteUsuario(id: string): Promise<void> {
  // TODO: reemplazar con DELETE /api/v1/usuarios/:id
  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx !== -1) mockUsers.splice(idx, 1)
}
