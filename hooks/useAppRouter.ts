import { useState, useCallback, useEffect } from "react"
import type { Cliente } from "@/lib/types"

export type Page =
  | "dashboard"
  | "clientes"
  | "nueva-visita"
  | "registrar-inventario"
  | "historial"
  | "inventario-actual"
  | "reporte-estancado"
  | "reporte-vencimientos"
  | "mantenimiento-productos"
  | "mantenimiento-clientes"
  | "mantenimiento-categorias"
  | "gestion-usuarios"

export function useAppRouter() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("currentPage") as Page) || "dashboard"
    }
    return "dashboard"
  })
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("selectedCliente")
      return raw ? JSON.parse(raw) : null
    }
    return null
  })
  const [currentVisitaId, setCurrentVisitaId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentVisitaId") || null
    }
    return null
  })

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage)
  }, [currentPage])
  useEffect(() => {
    if (selectedCliente) {
      localStorage.setItem("selectedCliente", JSON.stringify(selectedCliente))
    } else {
      localStorage.removeItem("selectedCliente")
    }
  }, [selectedCliente])
  useEffect(() => {
    if (currentVisitaId) {
      localStorage.setItem("currentVisitaId", currentVisitaId)
    } else {
      localStorage.removeItem("currentVisitaId")
    }
  }, [currentVisitaId])
  const navigate = useCallback((page: string) => {
    setCurrentPage(page as Page)
  }, [])

  const selectCliente = useCallback((cliente: Cliente) => {
    setSelectedCliente(cliente)
    setCurrentPage("nueva-visita")
  }, [])

  const onVisitaCreated = useCallback((visitaId: string) => {
    setCurrentVisitaId(visitaId)
    setCurrentPage("registrar-inventario")
  }, [])

  const backToDashboard = useCallback(() => {
    setCurrentPage("dashboard")
    setSelectedCliente(null)
    setCurrentVisitaId(null)
    localStorage.removeItem("selectedCliente")
    localStorage.removeItem("currentVisitaId")
  }, [])

  return {
    currentPage,
    selectedCliente,
    currentVisitaId,
    navigate,
    selectCliente,
    onVisitaCreated,
    backToDashboard,
  }
}
