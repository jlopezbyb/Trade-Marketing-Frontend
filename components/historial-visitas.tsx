"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react"
import { mockVisitas } from "@/lib/mock-data"

interface HistorialVisitasProps {
  onBack?: () => void
}

export function HistorialVisitas({ onBack }: HistorialVisitasProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">Historial de Visitas</h2>
            <p className="text-sm text-muted-foreground">Tus visitas recientes</p>
          </div>
        </div>
      </div>

      {/* Visit List */}
      <div className="flex-1 p-4 space-y-3">
        {mockVisitas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay visitas registradas
          </div>
        ) : (
          mockVisitas.map((visita) => (
            <Card key={visita.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{visita.clienteNombre}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{visita.fecha}</span>
                  </div>
                </div>
              </CardHeader>
              {visita.observaciones && (
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{visita.observaciones}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
