"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, AlertTriangle, Package, Calendar, Clock } from "lucide-react"
import { mockInventarioEstancado } from "@/lib/mock-data"

interface ReporteEstancadoProps {
  onBack?: () => void
}

export function ReporteEstancado({ onBack }: ReporteEstancadoProps) {
  const [diasFilter, setDiasFilter] = useState("7")

  const filteredInventario = mockInventarioEstancado.filter(
    (item) => item.diasSinCambio >= parseInt(diasFilter)
  )

  const handleExportCSV = () => {
    const headers = ["Cliente", "Producto", "Cantidad", "Última Actualización", "Días Sin Cambio"]
    const rows = filteredInventario.map((item) => [
      item.clienteNombre,
      item.productoNombre,
      item.cantidad.toString(),
      item.fechaActualizacion,
      item.diasSinCambio.toString(),
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventario-estancado-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
            <h2 className="text-xl font-bold text-foreground">Inventario Estancado</h2>
            <p className="text-sm text-muted-foreground">{filteredInventario.length} productos sin rotación</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={diasFilter} onValueChange={setDiasFilter}>
            <SelectTrigger className="h-12 flex-1">
              <SelectValue placeholder="Días sin cambio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3+ días</SelectItem>
              <SelectItem value="7">7+ días</SelectItem>
              <SelectItem value="14">14+ días</SelectItem>
              <SelectItem value="30">30+ días</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="h-12 gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 p-4 space-y-3">
        {filteredInventario.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              No hay productos estancados con {diasFilter}+ días sin rotación
            </p>
          </div>
        ) : (
          filteredInventario.map((item) => (
            <Card key={item.id} className="border-destructive/30 bg-destructive/5">
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
                    <div className="text-2xl font-bold text-foreground">{item.cantidad}</div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">{item.diasSinCambio} días</span>
                    </div>
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
