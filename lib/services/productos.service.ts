import type { Producto } from "@/lib/types"
import { mockProductos } from "@/lib/mock-data"

export async function getProductos(): Promise<Producto[]> {
  // TODO: reemplazar con GET /api/v1/productos
  return mockProductos
}

export async function getProductoById(id: string): Promise<Producto | undefined> {
  // TODO: reemplazar con GET /api/v1/productos/:id
  return mockProductos.find((p) => p.id === id)
}

export async function createProducto(data: Omit<Producto, "id">): Promise<Producto> {
  // TODO: reemplazar con POST /api/v1/productos
  const nuevo: Producto = { ...data, id: String(Date.now()) }
  mockProductos.push(nuevo)
  return nuevo
}

export async function updateProducto(id: string, data: Partial<Producto>): Promise<Producto> {
  // TODO: reemplazar con PUT /api/v1/productos/:id
  const idx = mockProductos.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error("Producto no encontrado")
  mockProductos[idx] = { ...mockProductos[idx], ...data }
  return mockProductos[idx]
}

export async function deleteProducto(id: string): Promise<void> {
  // TODO: reemplazar con DELETE /api/v1/productos/:id
  const idx = mockProductos.findIndex((p) => p.id === id)
  if (idx !== -1) mockProductos.splice(idx, 1)
}
