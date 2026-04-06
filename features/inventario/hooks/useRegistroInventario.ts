import { useState, useEffect, useCallback } from "react"
import { getProductos } from "@/lib/services/productos.service"
import type { LoteInventario, Producto } from "@/lib/types"

export interface ProductoConLotes {
  productoId: string
  productoNombre: string
  sku: string
  unidad: string
  lotes: LoteInventario[]
}

export function useRegistroInventario() {
  const [productosConLotes, setProductosConLotes] = useState<ProductoConLotes[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getProductos().then(setProductos)
  }, [])

  const productosDisponibles = productos.filter(
    (p) => p.activo && !productosConLotes.find((pl) => pl.productoId === p.id)
  )

  const agregarProducto = useCallback((productoId: string) => {
    const producto = productos.find((p) => p.id === productoId)
    if (!producto) return

    if (productosConLotes.find((p) => p.productoId === productoId)) return

    setProductosConLotes((prev) => [
      ...prev,
      {
        productoId: producto.id,
        productoNombre: producto.nombre,
        sku: producto.sku,
        unidad: producto.unidad,
        lotes: [
          {
            id: `lote-${Date.now()}`,
            lote: "",
            cantidad: 0,
            fechaVencimiento: "",
          },
        ],
      },
    ])
  }, [productos, productosConLotes])

  const eliminarProducto = useCallback((productoId: string) => {
    setProductosConLotes((prev) => prev.filter((p) => p.productoId !== productoId))
  }, [])

  const agregarLote = useCallback((productoId: string) => {
    setProductosConLotes((prev) =>
      prev.map((p) => {
        if (p.productoId === productoId) {
          return {
            ...p,
            lotes: [
              ...p.lotes,
              {
                id: `lote-${Date.now()}`,
                lote: "",
                cantidad: 0,
                fechaVencimiento: "",
              },
            ],
          }
        }
        return p
      })
    )
  }, [])

  const eliminarLote = useCallback((productoId: string, loteId: string) => {
    setProductosConLotes((prev) =>
      prev.map((p) => {
        if (p.productoId === productoId) {
          const nuevosLotes = p.lotes.filter((l) => l.id !== loteId)
          return {
            ...p,
            lotes: nuevosLotes.length > 0 ? nuevosLotes : p.lotes,
          }
        }
        return p
      })
    )
  }, [])

  const actualizarLote = useCallback((
    productoId: string,
    loteId: string,
    campo: keyof LoteInventario,
    valor: string | number
  ) => {
    setProductosConLotes((prev) =>
      prev.map((p) => {
        if (p.productoId === productoId) {
          return {
            ...p,
            lotes: p.lotes.map((l) => {
              if (l.id === loteId) {
                return { ...l, [campo]: valor }
              }
              return l
            }),
          }
        }
        return p
      })
    )
  }, [])

  const calcularSubtotal = useCallback((producto: ProductoConLotes) => {
    return producto.lotes.reduce((sum, lote) => sum + lote.cantidad, 0)
  }, [])

  const calcularTotal = useCallback(() => {
    return productosConLotes.reduce((sum, p) => sum + calcularSubtotal(p), 0)
  }, [productosConLotes, calcularSubtotal])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSuccess(true)
  }, [])

  return {
    productosConLotes,
    productos,
    productosDisponibles,
    success,
    agregarProducto,
    eliminarProducto,
    agregarLote,
    eliminarLote,
    actualizarLote,
    calcularSubtotal,
    calcularTotal,
    handleSubmit,
  }
}
