import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Devuelve la URL completa de la imagen del producto
export function getProductoImageUrl(imagen?: string) {
  if (!imagen) return undefined
  if (imagen.startsWith("data:")) return imagen // base64
  // Si la imagen ya contiene /uploads/productos/ no anteponer nada
  if (imagen.startsWith("/uploads/productos/") || imagen.includes("/uploads/productos/")) {
    // Si la URL es absoluta (http...) la dejamos igual
    if (/^https?:\/\//.test(imagen)) return imagen
    // Si es relativa, anteponer el host base
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500").replace(/\/api\/v1$/, "")
    return `${base}${imagen.startsWith("/") ? imagen : "/" + imagen}`
  }
  // Si solo es el nombre de archivo
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500").replace(/\/api\/v1$/, "")
  return `${base}/uploads/productos/${imagen}`
}
