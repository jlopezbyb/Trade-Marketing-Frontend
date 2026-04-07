import { useState, useCallback } from "react"
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
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [currentVisitaId, setCurrentVisitaId] = useState<string | null>(null)

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
