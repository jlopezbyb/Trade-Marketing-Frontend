"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Calendar, Filter } from "lucide-react"
import { mockInventarioActual, mockClientes, mockProductos } from "@/lib/mock-data"

interface InventarioActualProps {
  onBack?: () => void
}

export function InventarioActual({ onBack }: InventarioActualProps) {
  const [search, setSearch] = useState("")
  const [clienteFilter, setClienteFilter] = useState("all")
  const [productoFilter, setProductoFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredInventario = mockInventarioActual.filter((item) => {
    const matchesSearch = item.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.productoNombre.toLowerCase().includes(search.toLowerCase())
    const matchesCliente = clienteFilter === "all" || item.clienteId === clienteFilter
    const matchesProducto = productoFilter === "all" || item.productoId === productoFilter
    return matchesSearch && matchesCliente && matchesProducto
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 space-y-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">Inventario Actual</h2>
            <p className="text-sm text-muted-foreground">{filteredInventario.length} registros</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            className="h-12 w-12"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <Select value={clienteFilter} onValueChange={setClienteFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {mockClientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={productoFilter} onValueChange={setProductoFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                {mockProductos.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Inventory List */}
      <div className="flex-1 p-4 space-y-3">
        {filteredInventario.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron registros
          </div>
        ) : (
          filteredInventario.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{item.clienteNombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.productoNombre}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.fechaActualizacion}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{item.cantidad}</div>
                    <div className="text-xs text-muted-foreground">unidades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
