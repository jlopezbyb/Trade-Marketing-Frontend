"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Download, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Package,
  Calendar,
  Building2,
} from "lucide-react"
import { useReporteVencimientos } from "../hooks/useReporteVencimientos"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function ReporteVencimientos() {
  const {
    filtroCliente,
    setFiltroCliente,
    filtroEstado,
    setFiltroEstado,
    clientes,
    productosFiltrados,
    countByEstado,
    getEstadoConfig,
    exportToXLSX,
  } = useReporteVencimientos()

  const { page, pageCount, items: productosPaginados, nextPage, prevPage, goToPage } = usePagination(
    productosFiltrados,
    10
  )

  return (
    <div className="space-y-6 px-4 pt-6 sm:px-8 sm:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Productos por Vencer</h2>
          <p className="text-muted-foreground">
            Control de fechas de vencimiento por cliente y producto
          </p>
        </div>
        <Button onClick={exportToXLSX}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{countByEstado.critico}</p>
                <p className="text-xs text-red-600/80">Crítico (0-7 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{countByEstado.alerta}</p>
                <p className="text-xs text-amber-600/80">Alerta (8-15 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{countByEstado.proximo}</p>
                <p className="text-xs text-blue-600/80">Próximo (16-30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filtroCliente} onValueChange={setFiltroCliente}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los clientes</SelectItem>
            {clientes
              .filter((c) => c.activo)
              .map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="critico">Crítico (0-7 días)</SelectItem>
            <SelectItem value="alerta">Alerta (8-15 días)</SelectItem>
            <SelectItem value="proximo">Próximo (16-30 días)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {productosFiltrados.length > 0 ? (
          productosPaginados.map((producto) => {
            const config = getEstadoConfig(producto.estado)
            const Icon = config.icon
            return (
              <Card key={producto.id} className={`border-l-4 ${
                producto.estado === "critico" 
                  ? "border-l-red-500" 
                  : producto.estado === "alerta" 
                  ? "border-l-amber-500" 
                  : "border-l-blue-500"
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`p-3 rounded-lg ${config.bg} shrink-0`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{producto.productoNombre}</h3>
                        <Badge className={config.badge}>
                          {producto.diasParaVencer} días
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{producto.clienteNombre}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="h-3 w-3" />
                          <span>Lote: {producto.lote}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="font-medium">{producto.cantidad} uds</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{producto.fechaVencimiento}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No hay productos próximos a vencer con los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        )}

        {productosFiltrados.length > 0 && pageCount > 1 && (
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
