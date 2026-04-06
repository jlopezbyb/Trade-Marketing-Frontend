import { useState, useEffect, useCallback } from "react"
import { getProductosPorVencer } from "@/lib/services/inventario.service"
import { getClientes } from "@/lib/services/clientes.service"
import type { ProductoPorVencer, Cliente } from "@/lib/types"
import { AlertTriangle, AlertCircle, Clock } from "lucide-react"

export function useReporteVencimientos() {
  const [filtroCliente, setFiltroCliente] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [porVencer, setPorVencer] = useState<ProductoPorVencer[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    getProductosPorVencer().then(setPorVencer)
    getClientes().then(setClientes)
  }, [])

  const productosFiltrados = porVencer.filter((p) => {
    const matchCliente = filtroCliente === "todos" || p.clienteId === filtroCliente
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado
    return matchCliente && matchEstado
  })

  const countByEstado = {
    critico: porVencer.filter((p) => p.estado === "critico").length,
    alerta: porVencer.filter((p) => p.estado === "alerta").length,
    proximo: porVencer.filter((p) => p.estado === "proximo").length,
  }

  const getEstadoConfig = useCallback((estado: string) => {
    switch (estado) {
      case "critico":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bg: "bg-red-100",
          badge: "bg-red-500 text-white",
          label: "Crítico (0-7 días)",
        }
      case "alerta":
        return {
          icon: AlertCircle,
          color: "text-amber-600",
          bg: "bg-amber-100",
          badge: "bg-amber-500 text-white",
          label: "Alerta (8-15 días)",
        }
      case "proximo":
        return {
          icon: Clock,
          color: "text-blue-600",
          bg: "bg-blue-100",
          badge: "bg-blue-500 text-white",
          label: "Próximo (16-30 días)",
        }
      default:
        return {
          icon: Clock,
          color: "text-muted-foreground",
          bg: "bg-muted",
          badge: "bg-muted text-muted-foreground",
          label: "Sin definir",
        }
    }
  }, [])

  const exportToCSV = useCallback(() => {
    const headers = [
      "Cliente",
      "Producto",
      "Lote",
      "Cantidad",
      "Fecha Vencimiento",
      "Días para Vencer",
      "Estado",
    ]
    const rows = productosFiltrados.map((p) => [
      p.clienteNombre,
      p.productoNombre,
      p.lote,
      p.cantidad,
      p.fechaVencimiento,
      p.diasParaVencer,
      p.estado,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-vencimientos-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }, [productosFiltrados])

  return {
    filtroCliente,
    setFiltroCliente,
    filtroEstado,
    setFiltroEstado,
    porVencer,
    clientes,
    productosFiltrados,
    countByEstado,
    getEstadoConfig,
    exportToCSV,
  }
}
