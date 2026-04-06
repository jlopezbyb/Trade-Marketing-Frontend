import { useState, useEffect } from "react"
import { getInventarioActual } from "@/lib/services/inventario.service"
import { getClientes } from "@/lib/services/clientes.service"
import { getProductos } from "@/lib/services/productos.service"
import type { InventarioItem, Cliente, Producto } from "@/lib/types"

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

  const filteredInventario = inventario.filter((item) => {
    const matchesSearch =
      item.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.productoNombre.toLowerCase().includes(search.toLowerCase())
    const matchesCliente = clienteFilter === "all" || item.clienteId === clienteFilter
    const matchesProducto = productoFilter === "all" || item.productoId === productoFilter
    return matchesSearch && matchesCliente && matchesProducto
  })

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
  }
}
