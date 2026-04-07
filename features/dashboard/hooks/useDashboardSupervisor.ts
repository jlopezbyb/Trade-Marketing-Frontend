import { useRef, useCallback, useState, useEffect } from "react"
import { getProductosPorVencer } from "@/lib/services/reportes.service"
import { getClientes } from "@/lib/services/clientes.service"
import type { ProductoPorVencer, Cliente } from "@/lib/types"

export function useDashboardSupervisor() {
  const chartRef1 = useRef<HTMLDivElement>(null)
  const chartRef2 = useRef<HTMLDivElement>(null)
  const chartRef3 = useRef<HTMLDivElement>(null)
  const [porVencer, setPorVencer] = useState<ProductoPorVencer[]>([])
  const [clientesList, setClientesList] = useState<Cliente[]>([])

  useEffect(() => {
    getProductosPorVencer().then(setPorVencer)
    getClientes().then(setClientesList)
  }, [])

  const summaryData = {
    clientesHoy: 8,
    productosEstancados: 2,
    totalInventario: 156,
    visitasSemana: 61,
    cambioVisitas: 27,
  }

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
    downloadChart,
  }
}
