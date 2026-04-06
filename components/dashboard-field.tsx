"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ClipboardList, Package } from "lucide-react"

interface DashboardFieldProps {
  onNavigate: (page: string) => void
}

export function DashboardField({ onNavigate }: DashboardFieldProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Welcome section with gold accents */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 p-6 text-primary-foreground border-2 border-gold">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-1">Bienvenido</h2>
          <p className="text-primary-foreground/80">Selecciona una accion para comenzar</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gold/50 hover:border-gold group relative overflow-hidden"
          onClick={() => onNavigate("nueva-visita")}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 group-hover:shadow-gold/25 transition-shadow">
                <Plus className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-gold-dark transition-colors">Nueva Visita</CardTitle>
                <CardDescription>Registrar una visita a cliente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-gold-dark transition-all duration-300 shadow-lg hover:shadow-gold/30">
              Iniciar Visita
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gold/50 hover:border-gold group"
          onClick={() => onNavigate("clientes")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border border-gold/10 group-hover:border-gold/30 transition-colors">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-gold-dark transition-colors">Ver Clientes</CardTitle>
                <CardDescription>Lista de clientes asignados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full h-12 text-base font-medium border border-gold/20 hover:border-gold/40 hover:bg-gold/10 transition-all">
              Ver Lista
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gold/50 hover:border-gold group"
          onClick={() => onNavigate("historial")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border border-gold/10 group-hover:border-gold/30 transition-colors">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-gold-dark transition-colors">Historial de Visitas</CardTitle>
                <CardDescription>Ver visitas anteriores</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full h-12 text-base font-medium border border-gold/20 hover:border-gold/40 hover:bg-gold/10 transition-all">
              Ver Historial
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-gold/50 hover:border-gold group"
          onClick={() => onNavigate("inventario-actual")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border border-gold/10 group-hover:border-gold/30 transition-colors">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-gold-dark transition-colors">Inventario Actual</CardTitle>
                <CardDescription>Ver estado del inventario</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full h-12 text-base font-medium border border-gold/20 hover:border-gold/40 hover:bg-gold/10 transition-all">
              Ver Inventario
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
