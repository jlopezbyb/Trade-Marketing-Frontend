import { useRef, useCallback, useState, useEffect } from "react"
import {
  getProductosPorVencer,
  getDashboardSummary,
  getInventarioEstancado,
} from "@/lib/services/reportes.service"
import { getInventarioActual } from "@/lib/services/inventario.service"
import { getClientes } from "@/lib/services/clientes.service"
import { getVisitas } from "@/lib/services/visitas.service"
import type { ProductoPorVencer } from "@/features/reportes/types"
import type { Cliente } from "@/features/clientes/types"

export function useDashboardSupervisor() {
  const chartRef1 = useRef<HTMLDivElement>(null)
  const chartRef2 = useRef<HTMLDivElement>(null)
  const chartRef3 = useRef<HTMLDivElement>(null)
  const [porVencer, setPorVencer] = useState<ProductoPorVencer[]>([])
  const [clientesList, setClientesList] = useState<Cliente[]>([])
  const [summaryData, setSummaryData] = useState({
    clientesHoy: 0,
    visitasSemana: 0,
    cambioVisitas: 0,
    productosEstancados: 0,
    totalInventario: 0,
  })
  const [inventarioPorProducto, setInventarioPorProducto] = useState<{ nombre: string; cantidad: number }[]>([])
  const [tendenciaVisitas, setTendenciaVisitas] = useState<{ semana: string; visitas: number; inventario: number }[]>([])
  const [visitasPorDia, setVisitasPorDia] = useState<{ dia: string; visitas: number }[]>([])

  useEffect(() => {
    getProductosPorVencer().then(setPorVencer)
    getClientes().then(setClientesList)
    getDashboardSummary().then((res) => {
      setSummaryData({
        clientesHoy: res.totalClientes ?? 0,
        // visitasSemana y cambioVisitas se calculan a partir de getVisitas()
        visitasSemana: 0,
        cambioVisitas: 0,
        productosEstancados: res.inventarioEstancado ?? 0,
        totalInventario: res.totalInventario ?? 0,
      })
    })
    // Asegurar que "Estancados" use el conteo real del reporte
    getInventarioEstancado().then((items) => {
      setSummaryData((prev) => ({
        ...prev,
        productosEstancados: items.length,
      }))
    })
    getInventarioActual().then((items) => {
      // Agrupar por productoNombre y sumar cantidades
      const map = new Map<string, number>()
      items.forEach((item) => {
        map.set(item.productoNombre, (map.get(item.productoNombre) || 0) + item.cantidad)
      })
      setInventarioPorProducto(Array.from(map.entries()).map(([nombre, cantidad]) => ({ nombre, cantidad })))
      // Agrupar inventario por semana (usando fechaActualizacion)
      const inventarioPorSemana = new Map<string, number>()
      items.forEach((item) => {
        const week = getWeekLabel(item.fechaActualizacion)
        inventarioPorSemana.set(week, (inventarioPorSemana.get(week) || 0) + item.cantidad)
      })
      // Consultar visitas y agrupar por semana
      getVisitas().then((visitas) => {
        // Agrupar por semana para tendencia
        const visitasPorSemana = new Map<string, number>()
        visitas.forEach((v) => {
          const week = getWeekLabel(v.fecha)
          visitasPorSemana.set(week, (visitasPorSemana.get(week) || 0) + 1)
        })
        // Calcular visitas de la semana actual y variación vs semana anterior
        const semanasOrdenadas = Array.from(visitasPorSemana.keys()).sort()
        const semanaActualKey = semanasOrdenadas[semanasOrdenadas.length - 1]
        const semanaAnteriorKey = semanasOrdenadas.length > 1 ? semanasOrdenadas[semanasOrdenadas.length - 2] : undefined

        const visitasSemanaActual = semanaActualKey ? visitasPorSemana.get(semanaActualKey) || 0 : 0
        const visitasSemanaAnterior = semanaAnteriorKey ? visitasPorSemana.get(semanaAnteriorKey) || 0 : 0

        const cambioVisitas =
          visitasSemanaAnterior > 0
            ? Math.round((visitasSemanaActual / visitasSemanaAnterior) * 100 - 100)
            : 0

        setSummaryData((prev) => ({
          ...prev,
          visitasSemana: visitasSemanaActual,
          cambioVisitas,
        }))
        // Unir ambas series por semana
        const allWeeks = Array.from(new Set([...Array.from(inventarioPorSemana.keys()), ...Array.from(visitasPorSemana.keys())]))
        allWeeks.sort()
        setTendenciaVisitas(
          allWeeks.map((semana) => ({
            semana,
            visitas: visitasPorSemana.get(semana) || 0,
            inventario: inventarioPorSemana.get(semana) || 0,
          }))
        )
        // Agrupar por día de la semana para visitasPorDia
        const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
        const visitasPorDiaMap = new Map<string, number>()
        visitas.forEach((v) => {
          const d = new Date(v.fecha)
          const dia = dias[d.getDay()]
          visitasPorDiaMap.set(dia, (visitasPorDiaMap.get(dia) || 0) + 1)
        })
        // Ordenar por semana laboral (Lun-Dom)
        const orderedDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
        setVisitasPorDia(
          orderedDias.map((dia) => ({ dia, visitas: visitasPorDiaMap.get(dia) || 0 }))
        )
      })
    })
  }, [])

  // Utilidad para obtener etiqueta de semana a partir de fecha (YYYY-MM-DD)
  function getWeekLabel(fecha: string): string {
    const d = new Date(fecha)
    const year = d.getFullYear()
    const firstDay = new Date(d.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((d.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const week = Math.ceil(dayOfYear / 7)
    return `Sem ${week}`
  }

  // summaryData ahora viene del estado y se actualiza con el endpoint

  const vencimientosPorCliente = clientesList
    .filter((c) => c.activo)
    .map((cliente) => {
      const productos = porVencer.filter((p) => p.clienteId === cliente.id)
      const criticos = productos.filter((p) => p.estado === "critico").length
      const alertas = productos.filter((p) => p.estado === "alerta").length
      const proximos = productos.filter((p) => p.estado === "proximo").length
      return {
        ...cliente,
        criticos,
        alertas,
        proximos,
        total: criticos + alertas + proximos,
      }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.criticos - a.criticos || b.alertas - a.alertas)

  const downloadChart = useCallback(async (chartRef: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (!chartRef.current) return

    try {
      const svg = chartRef.current.querySelector("svg")
      if (!svg) return

      const clonedSvg = svg.cloneNode(true) as SVGElement
      const svgStyles = window.getComputedStyle(svg)
      clonedSvg.setAttribute("style", `background-color: white; font-family: ${svgStyles.fontFamily}`)

      const bbox = svg.getBoundingClientRect()
      clonedSvg.setAttribute("width", String(bbox.width))
      clonedSvg.setAttribute("height", String(bbox.height))

      const cssVarElements = clonedSvg.querySelectorAll("[fill], [stroke]")
      cssVarElements.forEach((el) => {
        const fill = el.getAttribute("fill")
        const stroke = el.getAttribute("stroke")

        if (fill && fill.includes("var(--")) {
          const computedColor = getComputedStyle(document.documentElement).getPropertyValue(
            fill.replace("var(", "").replace(")", "").trim()
          )
          if (computedColor) el.setAttribute("fill", computedColor.trim())
        }
        if (stroke && stroke.includes("var(--")) {
          const computedColor = getComputedStyle(document.documentElement).getPropertyValue(
            stroke.replace("var(", "").replace(")", "").trim()
          )
          if (computedColor) el.setAttribute("stroke", computedColor.trim())
        }
      })

      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(clonedSvg)
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        canvas.width = bbox.width * 2
        canvas.height = bbox.height * 2
        ctx.scale(2, 2)
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, bbox.width, bbox.height)
        ctx.drawImage(img, 0, 0, bbox.width, bbox.height)

        const link = document.createElement("a")
        link.download = `${fileName}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        URL.revokeObjectURL(svgUrl)
      }

      img.src = svgUrl
    } catch (error) {
      console.error("Error downloading chart:", error)
    }
  }, [])

  return {
    chartRef1,
    chartRef2,
    chartRef3,
    porVencer,
    clientesList,
    summaryData,
    vencimientosPorCliente,
    inventarioPorProducto,
    tendenciaVisitas,
    visitasPorDia,
    downloadChart,
  }
}
