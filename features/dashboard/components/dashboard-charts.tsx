"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageDown } from "lucide-react"
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

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #d4a574",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(212, 165, 116, 0.15)",
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
  { nombre: "Aceite", cantidad: 36 },
  { nombre: "Arroz", cantidad: 54 },
  { nombre: "Frijol", cantidad: 18 },
  { nombre: "Azucar", cantidad: 48 },
  { nombre: "Harina", cantidad: 20 },
]

const pieColors = ["#007e2e", "#d4a574", "#22c55e", "#b8860b", "#4ade80"]

const tendenciaVisitas = [
  { semana: "Sem 1", visitas: 45, inventario: 120 },
  { semana: "Sem 2", visitas: 52, inventario: 135 },
  { semana: "Sem 3", visitas: 48, inventario: 128 },
  { semana: "Sem 4", visitas: 61, inventario: 156 },
]

interface DashboardChartsProps {
  chartRef1: React.RefObject<HTMLDivElement | null>
  chartRef2: React.RefObject<HTMLDivElement | null>
  chartRef3: React.RefObject<HTMLDivElement | null>
  downloadChart: (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => void
}

export function DashboardCharts({ chartRef1, chartRef2, chartRef3, downloadChart }: DashboardChartsProps) {
  return (
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
                <Tooltip contentStyle={tooltipStyle} />
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
                  {inventarioPorProducto.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
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
                <Tooltip contentStyle={tooltipStyle} />
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
  )
}
