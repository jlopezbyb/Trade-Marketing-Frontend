// Helper para construir la URL absoluta de imagen de producto
export function getProductoImageUrl(imagen: string | undefined) {
  if (!imagen) return ""
  if (imagen.startsWith("http")) return imagen
  // Obtener la base URL del backend de variable de entorno pública
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1$/, "") || ""
  if (imagen.startsWith("/uploads")) return `${baseUrl}${imagen}`
  return imagen
}
import { apiFetch, USE_MOCK, type PaginatedResponse } from "@/lib/api-client"
import type { Producto } from "@/lib/types"
import { mockProductos } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

interface ProductoAPI {
  id: string
  nombre: string
  sku: string
  unidad: string
  categoria_id?: string
  imagen_url?: string | null
  activo: boolean
  categoria?: { id: string; nombre: string; color: string }
}

function mapProducto(raw: ProductoAPI): Producto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    sku: raw.sku,
    unidad: raw.unidad,
    imagen: raw.imagen_url ?? undefined,
    categoria: raw.categoria?.nombre ?? raw.categoria_id,
    categoriaId: raw.categoria_id,
    activo: raw.activo,
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getProductos(): Promise<Producto[]> {
  if (USE_MOCK) return mockProductos
  const res = await apiFetch<PaginatedResponse<ProductoAPI>>("/productos")
  return res.data.map(mapProducto)
}

export async function getProductoById(id: string): Promise<Producto | undefined> {
  if (USE_MOCK) return mockProductos.find((p) => p.id === id)
  const raw = await apiFetch<ProductoAPI>(`/productos/${encodeURIComponent(id)}`)
  return mapProducto(raw)
}

// Si isFormData es true, data debe ser FormData y se envía como multipart
export async function createProducto(data: any, isFormData = false): Promise<Producto> {
  if (USE_MOCK) {
    const nuevo: Producto = { ...data, id: String(Date.now()) }
    mockProductos.push(nuevo)
    return nuevo
  }
  const options: RequestInit = {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
    headers: undefined,
  }
  // No enviar Content-Type si es FormData
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" }
  }
  const raw = await apiFetch<ProductoAPI>("/productos", options)
  return mapProducto(raw)
}

export async function updateProducto(id: string, data: any, isFormData = false): Promise<Producto> {
  if (USE_MOCK) {
    const idx = mockProductos.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error("Producto no encontrado")
    mockProductos[idx] = { ...mockProductos[idx], ...data }
    return mockProductos[idx]
  }
  const options: RequestInit = {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
    headers: undefined,
  }
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" }
  }
  const raw = await apiFetch<ProductoAPI>(`/productos/${encodeURIComponent(id)}`, options)
  return mapProducto(raw)
}

export async function deleteProducto(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockProductos.findIndex((p) => p.id === id)
    if (idx !== -1) mockProductos.splice(idx, 1)
    return
  }
  return apiFetch<void>(`/productos/${encodeURIComponent(id)}`, { method: "DELETE" })
}
