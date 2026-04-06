import type { Categoria } from "@/lib/types"
import { mockCategorias } from "@/lib/mock-data"

export async function getCategorias(): Promise<Categoria[]> {
  // TODO: reemplazar con GET /api/v1/categorias
  return mockCategorias
}

export async function createCategoria(data: Omit<Categoria, "id">): Promise<Categoria> {
  // TODO: reemplazar con POST /api/v1/categorias
  const nueva: Categoria = { ...data, id: String(Date.now()) }
  mockCategorias.push(nueva)
  return nueva
}

export async function updateCategoria(id: string, data: Partial<Categoria>): Promise<Categoria> {
  // TODO: reemplazar con PUT /api/v1/categorias/:id
  const idx = mockCategorias.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error("Categoría no encontrada")
  mockCategorias[idx] = { ...mockCategorias[idx], ...data }
  return mockCategorias[idx]
}

export async function deleteCategoria(id: string): Promise<void> {
  // TODO: reemplazar con DELETE /api/v1/categorias/:id
  const idx = mockCategorias.findIndex((c) => c.id === id)
  if (idx !== -1) mockCategorias.splice(idx, 1)
}
