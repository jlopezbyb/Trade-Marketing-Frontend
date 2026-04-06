"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, AlertTriangle, Package, TrendingUp, ImageDown, AlertCircle, Clock } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { useDashboardSupervisor } from "../hooks/useDashboardSupervisor"

interface DashboardSupervisorProps {
  onNavigate: (page: string) => void
}

// Chart data
const visitasPorDia = [
  { dia: "Lun", visitas: 12 },
  { dia: "Mar", visitas: 8 },
  { dia: "Mie", visitas: 15 },
  { dia: "Jue", visitas: 10 },
  { dia: "Vie", visitas: 18 },
  { dia: "Sab", visitas: 6 },
  { dia: "Dom", visitas: 2 },
]

const inventarioPorProducto = [
  { nombre: "Aceite", cantidad: 36, fill: "var(--chart-1)" },
  { nombre: "Arroz", cantidad: 54, fill: "var(--chart-2)" },
  { nombre: "Frijol", cantidad: 18, fill: "var(--chart-3)" },
  { nombre: "Azucar", cantidad: 48, fill: "var(--chart-4)" },
  { nombre: "Harina", cantidad: 20, fill: "var(--chart-5)" },
]

const tendenciaVisitas = [
  { semana: "Sem 1", visitas: 45, inventario: 120 },
  { semana: "Sem 2", visitas: 52, inventario: 135 },
  { semana: "Sem 3", visitas: 48, inventario: 128 },
  { semana: "Sem 4", visitas: 61, inventario: 156 },
]

export function DashboardSupervisor({ onNavigate }: DashboardSupervisorProps) {
  const {
    chartRef1,
    chartRef2,
    chartRef3,
    summaryData,
    vencimientosPorCliente,
    downloadChart,
  } = useDashboardSupervisor()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 p-6 text-primary-foreground border-2 border-gold">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-gold/15 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Panel de Supervisor</h2>
            <p className="text-primary-foreground/80">Resumen de actividad y metricas</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Semaforo de Vencimientos */}
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
              onClick={() => onNavigate("reporte-vencimientos")}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visitas por Dia */}
        <Card className="border-2 border-gold/50 hover:border-gold transition-colors">
          <CardHeader className="pb-2 border-b-2 border-gold/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Visitas por Dia</CardTitle>
                <CardDescription className="text-xs">Distribucion semanal de visitas</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => downloadChart(chartRef1, "visitas-por-dia")}
                title="Descargar grafica"
                className="hover:bg-gold/10 hover:text-gold"
              >
                <ImageDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]" ref={chartRef1}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white",
                      border: "1px solid #d4a574",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(212, 165, 116, 0.15)"
                    }}
                  />
                  <Bar dataKey="visitas" fill="#007e2e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Inventario por Producto */}
        <Card className="border-2 border-gold/50 hover:border-gold transition-colors">
          <CardHeader className="pb-2 border-b-2 border-gold/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Inventario por Producto</CardTitle>
                <CardDescription className="text-xs">Distribucion actual de productos</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => downloadChart(chartRef2, "inventario-por-producto")}
                title="Descargar grafica"
                className="hover:bg-gold/10 hover:text-gold"
              >
                <ImageDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]" ref={chartRef2}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventarioPorProducto}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="cantidad"
                    label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {inventarioPorProducto.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={["#007e2e", "#d4a574", "#22c55e", "#b8860b", "#4ade80"][index]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white",
                      border: "1px solid #d4a574",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(212, 165, 116, 0.15)"
                    }}
                    formatter={(value) => [`${value} unidades`, "Cantidad"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tendencia de Visitas e Inventario */}
        <Card className="lg:col-span-2 border-2 border-gold/50 hover:border-gold transition-colors">
          <CardHeader className="pb-2 border-b-2 border-gold/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tendencia Mensual</CardTitle>
                <CardDescription className="text-xs">Evolucion de visitas e inventario</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => downloadChart(chartRef3, "tendencia-mensual")}
                title="Descargar grafica"
                className="hover:bg-gold/10 hover:text-gold"
              >
                <ImageDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]" ref={chartRef3}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tendenciaVisitas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="semana" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white",
                      border: "1px solid #d4a574",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(212, 165, 116, 0.15)"
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visitas" 
                    stroke="#007e2e" 
                    strokeWidth={2}
                    dot={{ fill: "#007e2e" }}
                    name="Visitas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inventario" 
                    stroke="#d4a574" 
                    strokeWidth={2}
                    dot={{ fill: "#d4a574" }}
                    name="Inventario"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
