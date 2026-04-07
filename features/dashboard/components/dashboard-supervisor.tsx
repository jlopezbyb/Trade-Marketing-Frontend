"use client"

import { useDashboardSupervisor } from "../hooks/useDashboardSupervisor"
import { SummaryCards } from "./summary-cards"
import { SemaforoVencimientos } from "./semaforo-vencimientos"
import { DashboardCharts } from "./dashboard-charts"

interface DashboardSupervisorProps {
  onNavigate: (page: string) => void
}

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

      <SummaryCards summaryData={summaryData} />

      <SemaforoVencimientos
        vencimientosPorCliente={vencimientosPorCliente}
        onVerReporte={() => onNavigate("reporte-vencimientos")}
      />

      <DashboardCharts
        chartRef1={chartRef1}
        chartRef2={chartRef2}
        chartRef3={chartRef3}
        downloadChart={downloadChart}
      />
    </div>
  )
}
