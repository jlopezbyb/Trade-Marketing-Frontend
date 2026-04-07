import { useState, useEffect, useCallback, useMemo } from "react"
import * as XLSX from "xlsx"
import { getInventarioActual } from "@/lib/services/inventario.service"
import { getClientes } from "@/lib/services/clientes.service"
import { getProductos } from "@/lib/services/productos.service"
import type { InventarioItem } from "@/features/inventario/types"
import type { Cliente } from "@/features/clientes/types"
import type { Producto } from "@/features/productos/types"

export function useInventarioActual() {
  const [search, setSearch] = useState("")
  const [clienteFilter, setClienteFilter] = useState("all")
  const [productoFilter, setProductoFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [inventario, setInventario] = useState<InventarioItem[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  useEffect(() => {
    getInventarioActual().then(setInventario)
    getClientes().then(setClientes)
    getProductos().then(setProductos)
  }, [])

  const filteredInventario = useMemo(
    () =>
      inventario.filter((item) => {
        const matchesSearch =
          item.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
          item.productoNombre.toLowerCase().includes(search.toLowerCase())
        const matchesCliente = clienteFilter === "all" || item.clienteId === clienteFilter
        const matchesProducto = productoFilter === "all" || item.productoId === productoFilter
        return matchesSearch && matchesCliente && matchesProducto
      }),
    [inventario, search, clienteFilter, productoFilter]
  )

  const exportToXLSX = useCallback(() => {
    const headers = ["Cliente", "Producto", "Cantidad", "Fecha"]
    const rows = filteredInventario.map((item) => [
      item.clienteNombre,
      item.productoNombre,
      item.cantidad,
      item.fechaActualizacion,
    ])
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Actual")
    XLSX.writeFile(workbook, `inventario-actual-${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [filteredInventario])

  return {
    search,
    setSearch,
    clienteFilter,
    setClienteFilter,
    productoFilter,
    setProductoFilter,
    showFilters,
    setShowFilters,
    inventario,
    clientes,
    productos,
    filteredInventario,
    exportToXLSX,
  }
}
