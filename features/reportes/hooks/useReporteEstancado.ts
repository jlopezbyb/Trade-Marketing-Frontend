import { useState, useEffect, useCallback, useMemo } from "react"
import * as XLSX from "xlsx"
import { getInventarioEstancado } from "@/lib/services/reportes.service"
import type { InventarioEstancado } from "@/features/reportes/types"

export function useReporteEstancado() {
  const [diasFilter, setDiasFilter] = useState("7")
  const [estancados, setEstancados] = useState<InventarioEstancado[]>([])

  useEffect(() => {
    getInventarioEstancado().then(setEstancados)
  }, [])

  const filteredInventario = useMemo(
    () => estancados.filter((item) => item.diasSinCambio >= parseInt(diasFilter)),
    [estancados, diasFilter]
  )

  const handleExportXLSX = useCallback(() => {
    const headers = ["Cliente", "Producto", "Cantidad", "Última Actualización", "Días Sin Cambio"]
    const rows = filteredInventario.map((item) => [
      item.clienteNombre,
      item.productoNombre,
      item.cantidad,
      item.fechaActualizacion,
      item.diasSinCambio,
    ])
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Estancado")
    XLSX.writeFile(workbook, `inventario-estancado-${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [filteredInventario])

  return {
    diasFilter,
    setDiasFilter,
    estancados,
    filteredInventario,
    handleExportXLSX,
  }
}
