"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Calendar, Filter, Download } from "lucide-react"
import { useInventarioActual } from "../hooks/useInventarioActual"
import { useMemo } from "react"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface InventarioActualProps {
  onBack?: () => void
}

export function InventarioActual({ onBack }: InventarioActualProps) {
  const {
    search,
    setSearch,
    clienteFilter,
    setClienteFilter,
    productoFilter,
    setProductoFilter,
    showFilters,
    setShowFilters,
    clientes,
    productos,
    filteredInventario,
    exportToXLSX,
  } = useInventarioActual()

  const gruposPorCliente = useMemo(
    () => {
      const map = filteredInventario.reduce(
        (acc, item) => {
          if (!acc[item.clienteId]) acc[item.clienteId] = { clienteNombre: item.clienteNombre, items: [] as typeof filteredInventario }
          acc[item.clienteId].items.push(item)
          return acc
        },
        {} as Record<string, { clienteNombre: string; items: typeof filteredInventario }>
      )
      return Object.entries(map).map(([clienteId, grupo]) => ({ clienteId, ...grupo }))
    },
    [filteredInventario]
  )

  const { page, pageCount, items: gruposPaginados, nextPage, prevPage, goToPage } = usePagination(
    gruposPorCliente,
    5
  )

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
          <Button
            variant="outline"
            className="h-12 gap-2"
            onClick={exportToXLSX}
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
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
                {clientes.map((cliente) => (
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
                {productos.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Inventory List agrupada por cliente */}
      <div className="flex-1 p-4 space-y-3">
        {filteredInventario.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron registros
          </div>
        ) : (
          gruposPaginados.map((grupo) => (
            <Card key={grupo.clienteId}>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {grupo.clienteNombre || `Cliente #${grupo.clienteId}`}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="text-left py-1 pr-2 font-semibold">Producto</th>
                        <th className="text-left py-1 pr-2 font-semibold">Fecha</th>
                        <th className="text-right py-1 pl-2 font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-1 pr-2">{item.productoNombre}</td>
                          <td className="py-1 pr-2">{item.fechaActualizacion}</td>
                          <td className="py-1 pl-2 text-right font-bold text-primary">{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {filteredInventario.length > 0 && pageCount > 1 && (
          <div className="pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      prevPage()
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }).map((_, index) => {
                  const pageNumber = index + 1
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === page}
                        onClick={(e) => {
                          e.preventDefault()
                          goToPage(pageNumber)
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      nextPage()
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
