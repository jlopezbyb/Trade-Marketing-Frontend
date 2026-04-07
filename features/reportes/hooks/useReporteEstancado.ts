import { useState, useEffect, useCallback } from "react"
import { getInventarioEstancado } from "@/lib/services/reportes.service"
import type { InventarioEstancado } from "@/lib/types"

export function useReporteEstancado() {
  const [diasFilter, setDiasFilter] = useState("7")
  const [estancados, setEstancados] = useState<InventarioEstancado[]>([])

  useEffect(() => {
    getInventarioEstancado().then(setEstancados)
  }, [])

  const filteredInventario = estancados.filter(
    (item) => item.diasSinCambio >= parseInt(diasFilter)
  )

  const handleExportCSV = useCallback(() => {
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
  }, [filteredInventario])

  return {
    diasFilter,
    setDiasFilter,
    estancados,
    filteredInventario,
    handleExportCSV,
  }
}
