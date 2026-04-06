import type { Cliente } from "@/lib/types"
import { mockClientes } from "@/lib/mock-data"

export async function getClientes(): Promise<Cliente[]> {
  // TODO: reemplazar con GET /api/v1/clientes
  return mockClientes
}

export async function getClienteById(id: string): Promise<Cliente | undefined> {
  // TODO: reemplazar con GET /api/v1/clientes/:id
  return mockClientes.find((c) => c.id === id)
}

export async function createCliente(data: Omit<Cliente, "id">): Promise<Cliente> {
  // TODO: reemplazar con POST /api/v1/clientes
  const nuevo: Cliente = { ...data, id: String(Date.now()) }
  mockClientes.push(nuevo)
  return nuevo
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<Cliente> {
  // TODO: reemplazar con PUT /api/v1/clientes/:id
  const idx = mockClientes.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error("Cliente no encontrado")
  mockClientes[idx] = { ...mockClientes[idx], ...data }
  return mockClientes[idx]
}

export async function deleteCliente(id: string): Promise<void> {
  // TODO: reemplazar con DELETE /api/v1/clientes/:id
  const idx = mockClientes.findIndex((c) => c.id === id)
  if (idx !== -1) mockClientes.splice(idx, 1)
}
