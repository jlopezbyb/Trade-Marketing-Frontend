"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/features/auth"
import { AppHeader } from "@/shared/layout/app-header"
import { SupervisorSidebar } from "@/shared/layout/supervisor-sidebar"
import { DashboardField, DashboardSupervisor } from "@/features/dashboard"
import { ClientesList } from "@/features/clientes"
import { RegistrarVisita, HistorialVisitas } from "@/features/visitas"
import { RegistroInventario, InventarioActual } from "@/features/inventario"
import { ReporteEstancado, ReporteVencimientos } from "@/features/reportes"
import { MantenimientoProductos } from "@/features/productos"
import { MantenimientoClientes } from "@/features/clientes"
import { MantenimientoCategorias } from "@/features/categorias"
import { GestionUsuarios } from "@/features/usuarios"
import type { Cliente } from "@/lib/types"

type Page =
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

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [currentVisitaId, setCurrentVisitaId] = useState<string | null>(null)

  if (!user) {
    return <LoginForm onSuccess={() => {}} />
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page)
  }

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setCurrentPage("nueva-visita")
  }

  const handleVisitaCreated = (visitaId: string) => {
    setCurrentVisitaId(visitaId)
    setCurrentPage("registrar-inventario")
  }

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
    setSelectedCliente(null)
    setCurrentVisitaId(null)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "clientes":
        return (
          <ClientesList
            onBack={user.role === "field" ? handleBackToDashboard : undefined}
            onSelectCliente={handleSelectCliente}
          />
        )
      case "nueva-visita":
        if (!selectedCliente) {
          return (
            <ClientesList
              onBack={user.role === "field" ? handleBackToDashboard : undefined}
              onSelectCliente={handleSelectCliente}
            />
          )
        }
        return (
          <RegistrarVisita
            cliente={selectedCliente}
            onBack={handleBackToDashboard}
            onContinue={handleVisitaCreated}
          />
        )
      case "registrar-inventario":
        if (!selectedCliente || !currentVisitaId) {
          return (
            <ClientesList
              onBack={user.role === "field" ? handleBackToDashboard : undefined}
              onSelectCliente={handleSelectCliente}
            />
          )
        }
        return (
          <RegistroInventario
            cliente={selectedCliente}
            visitaId={currentVisitaId}
            onBack={handleBackToDashboard}
            onComplete={handleBackToDashboard}
          />
        )
      case "historial":
        return <HistorialVisitas onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "inventario-actual":
        return <InventarioActual onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "reporte-estancado":
        return <ReporteEstancado onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "reporte-vencimientos":
        return <ReporteVencimientos />
      case "mantenimiento-productos":
        return <MantenimientoProductos onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "mantenimiento-clientes":
        return <MantenimientoClientes onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "mantenimiento-categorias":
        return <MantenimientoCategorias onBack={user.role === "field" ? handleBackToDashboard : undefined} />
      case "gestion-usuarios":
        return <GestionUsuarios />
      default:
        return user.role === "field" ? (
          <DashboardField onNavigate={handleNavigate} />
        ) : (
          <DashboardSupervisor onNavigate={handleNavigate} />
        )
    }
  }

  // Supervisor layout with sidebar
  if (user.role === "supervisor") {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        <SupervisorSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto">{renderPage()}</main>
        </div>
      </div>
    )
  }

  // Field user layout (no sidebar)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1">{renderPage()}</main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
