"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertTriangle, Package, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
  summaryData: {
    clientesHoy: number
    visitasSemana: number
    cambioVisitas: number
    productosEstancados: number
    totalInventario: number
  }
}

export function SummaryCards({ summaryData }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-2 border-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/20 rounded-full blur-xl" />
        <CardHeader className="pb-1 pt-3 px-3">
          <CardDescription className="text-primary-foreground/80 text-xs">
            Clientes Hoy
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-2xl font-bold">{summaryData.clientesHoy}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gold/50 relative overflow-hidden group hover:border-gold transition-colors">
        <div className="absolute top-0 right-0 w-12 h-12 bg-gold/10 rounded-full blur-lg group-hover:bg-gold/20 transition-colors" />
        <CardHeader className="pb-1 pt-3 px-3">
          <CardDescription className="text-xs">Visitas Semana</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{summaryData.visitasSemana}</span>
            <span className="flex items-center text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              +{summaryData.cambioVisitas}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-destructive/10 border-2 border-gold/50">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardDescription className="text-destructive text-xs">Estancados</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">{summaryData.productosEstancados}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gold/50 relative overflow-hidden group hover:border-gold transition-colors">
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gold/10 rounded-full blur-lg group-hover:bg-gold/20 transition-colors" />
        <CardHeader className="pb-1 pt-3 px-3">
          <CardDescription className="text-xs">Total Inventario</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gold" />
            <span className="text-2xl font-bold">{summaryData.totalInventario}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
