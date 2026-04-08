"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { useAppRouter } from "@/hooks/useAppRouter"
import { LoginForm, UnauthorizedScreen } from "@/features/auth"
import { AppHeader } from "@/shared/layout/app-header"
import { SupervisorSidebar } from "@/shared/layout/supervisor-sidebar"
import { AppFooter } from "@/shared/layout/app-footer"
import { DashboardField, DashboardSupervisor } from "@/features/dashboard"
import { ClientesList } from "@/features/clientes"
import { RegistrarVisita, HistorialVisitas } from "@/features/visitas"
import { RegistroInventario, InventarioActual } from "@/features/inventario"
import { ReporteEstancado, ReporteVencimientos } from "@/features/reportes"
import { MantenimientoProductos } from "@/features/productos"
import { MantenimientoClientes } from "@/features/clientes"
import { MantenimientoCategorias } from "@/features/categorias"
import { GestionUsuarios } from "@/features/usuarios"
import { can } from "@/lib/permissions"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

function AppContent() {
  const { user, isRestoring } = useAuth()
  // const router = useRouter()
  const {
    currentPage,
    selectedCliente,
    currentVisitaId,
    navigate,
    selectCliente,
    onVisitaCreated,
    backToDashboard,
  } = useAppRouter()

  const isUnauthorizedForCurrentPage = () => {
    if (!user) return false

    switch (currentPage) {
      case "mantenimiento-productos":
        return !can(user.role, "productos", "editar")
      case "mantenimiento-clientes":
        return !can(user.role, "clientes", "editar")
      case "mantenimiento-categorias":
        return !can(user.role, "categorias", "editar")
      case "gestion-usuarios":
        return !can(user.role, "usuarios", "ver")
      default:
        return false
    }
  }

  const renderPage = () => {
    if (!user) return null

    if (isUnauthorizedForCurrentPage()) {
      return <UnauthorizedScreen onBack={backToDashboard} />
    }

    switch (currentPage) {
      case "clientes":
        return (
          <ClientesList
            onBack={user.role === "field" ? backToDashboard : undefined}
            onSelectCliente={selectCliente}
          />
        )
      case "nueva-visita":
        if (!selectedCliente) {
          return (
            <ClientesList
              onBack={user.role === "field" ? backToDashboard : undefined}
              onSelectCliente={selectCliente}
            />
          )
        }
        return (
          <RegistrarVisita
            cliente={selectedCliente}
            onBack={backToDashboard}
            onContinue={onVisitaCreated}
          />
        )
      case "registrar-inventario":
        if (!selectedCliente || !currentVisitaId) {
          return (
            <ClientesList
              onBack={user.role === "field" ? backToDashboard : undefined}
              onSelectCliente={selectCliente}
            />
          )
        }
        return (
          <RegistroInventario
            cliente={selectedCliente}
            visitaId={currentVisitaId}
            onBack={backToDashboard}
            onComplete={backToDashboard}
          />
        )
      case "historial":
        return <HistorialVisitas onBack={user.role === "field" ? backToDashboard : undefined} />
      case "inventario-actual":
        return <InventarioActual onBack={user.role === "field" ? backToDashboard : undefined} />
      case "reporte-estancado":
        return <ReporteEstancado onBack={user.role === "field" ? backToDashboard : undefined} />
      case "reporte-vencimientos":
        return <ReporteVencimientos />
      case "mantenimiento-productos":
        return (
          <MantenimientoProductos onBack={user.role === "field" ? backToDashboard : undefined} />
        )
      case "mantenimiento-clientes":
        return (
          <MantenimientoClientes onBack={user.role === "field" ? backToDashboard : undefined} />
        )
      case "mantenimiento-categorias":
        return (
          <MantenimientoCategorias onBack={user.role === "field" ? backToDashboard : undefined} />
        )
      case "gestion-usuarios":
        return <GestionUsuarios />
      default:
        // Página "dashboard" — renderizar según el rol
        return user.role === "field" ? (
          <DashboardField onNavigate={navigate} />
        ) : (
          <DashboardSupervisor onNavigate={navigate} />
        )
    }
  }

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-muted-foreground">Cargando sesión...</span>
      </div>
    )
  }
  if (!user) {
    return <LoginForm onSuccess={() => {}} />
  }

  // Supervisor layout with sidebar
  if (user.role === "supervisor") {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        <SupervisorSidebar currentPage={currentPage} onNavigate={navigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto">{renderPage()}</main>
          <AppFooter />
        </div>
      </div>
    )
  }

  // Field user layout (no sidebar)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1">{renderPage()}</main>
      <AppFooter />
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
