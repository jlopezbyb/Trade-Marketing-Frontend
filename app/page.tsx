"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { AppHeader } from "@/components/app-header"
import { SupervisorSidebar } from "@/components/supervisor-sidebar"
import { DashboardField } from "@/components/dashboard-field"
import { DashboardSupervisor } from "@/components/dashboard-supervisor"
import { ClientesList } from "@/components/clientes-list"
import { RegistrarVisita } from "@/components/registrar-visita"
import { RegistroInventario } from "@/components/registro-inventario"
import { HistorialVisitas } from "@/components/historial-visitas"
import { InventarioActual } from "@/components/inventario-actual"
import { ReporteEstancado } from "@/components/reporte-estancado"
import { ReporteVencimientos } from "@/components/reporte-vencimientos"
import { MantenimientoProductos } from "@/components/mantenimiento-productos"
import { MantenimientoClientes } from "@/components/mantenimiento-clientes"
import { MantenimientoCategorias } from "@/components/mantenimiento-categorias"
import { GestionUsuarios } from "@/components/gestion-usuarios"
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
      <div className="min-h-screen flex bg-background">
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
