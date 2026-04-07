import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { Categoria } from "@/lib/types"
import { mockCategorias } from "@/lib/mock-data"

export async function getCategorias(): Promise<Categoria[]> {
  if (USE_MOCK) return mockCategorias
  const res = await apiFetch<PaginatedResponse<Categoria>>("/categorias")
  return res.data
}

export async function createCategoria(data: Omit<Categoria, "id">): Promise<Categoria> {
  if (USE_MOCK) {
    const nueva: Categoria = { ...data, id: String(Date.now()) }
    mockCategorias.push(nueva)
    return nueva
  }
  return apiFetch<Categoria>("/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCategoria(id: string, data: Partial<Categoria>): Promise<Categoria> {
  if (USE_MOCK) {
    const idx = mockCategorias.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Categoría no encontrada")
    mockCategorias[idx] = { ...mockCategorias[idx], ...data }
    return mockCategorias[idx]
  }
  return apiFetch<Categoria>(`/categorias/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCategoria(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockCategorias.findIndex((c) => c.id === id)
    if (idx !== -1) mockCategorias.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/categorias/${encodeURIComponent(id)}`, { method: "DELETE" })
}
