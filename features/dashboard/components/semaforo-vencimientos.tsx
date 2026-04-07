"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Clock, Package } from "lucide-react"

interface ClienteVencimiento {
  id: string
  nombre: string
  criticos: number
  alertas: number
  proximos: number
  total: number
}

interface SemaforoVencimientosProps {
  vencimientosPorCliente: ClienteVencimiento[]
  onVerReporte: () => void
}

export function SemaforoVencimientos({ vencimientosPorCliente, onVerReporte }: SemaforoVencimientosProps) {
  return (
    <Card className="border-2 border-gold/50">
      <CardHeader className="pb-3 border-b-2 border-gold/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              Semaforo de Vencimientos por Cliente
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Productos proximos a vencer organizados por cliente
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onVerReporte}
            className="border-gold/30 hover:border-gold hover:bg-gold/10 transition-colors"
          >
            Ver Reporte Completo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {vencimientosPorCliente.length > 0 ? (
          <div className="space-y-3">
            {vencimientosPorCliente.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/50 to-transparent hover:from-gold/5 hover:to-transparent border border-transparent hover:border-gold/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-gold/20">
                    {cliente.nombre[0]}
                  </div>
                  <div>
                    <p className="font-medium">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{cliente.total} producto(s) por vencer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cliente.criticos > 0 && (
                    <Badge className="bg-red-500 text-white gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {cliente.criticos}
                    </Badge>
                  )}
                  {cliente.alertas > 0 && (
                    <Badge className="bg-amber-500 text-white gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {cliente.alertas}
                    </Badge>
                  )}
                  {cliente.proximos > 0 && (
                    <Badge className="bg-blue-500 text-white gap-1">
                      <Clock className="h-3 w-3" />
                      {cliente.proximos}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay productos proximos a vencer</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gold/10 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
            <span>Critico (0-7 dias)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span>Alerta (8-15 dias)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span>Proximo (16-30 dias)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
