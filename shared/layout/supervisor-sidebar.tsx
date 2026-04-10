"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Building2,
  UserCog,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
} from "lucide-react"

interface SupervisorSidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const menuItems = [
  {
    title: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { id: "inventario-actual", label: "Inventario Actual", icon: Package },
      { id: "clientes", label: "Ver Clientes", icon: Users },
      { id: "historial", label: "Historial Visitas", icon: ClipboardList },
    ],
  },
  {
    title: "Reportes",
    items: [
      { id: "reporte-estancado", label: "Inv. Estancado", icon: Clock },
      { id: "reporte-vencimientos", label: "Por Vencer", icon: AlertTriangle },
    ],
  },
  {
    title: "Administracion",
    items: [
      { id: "gestion-usuarios", label: "Usuarios", icon: UserCog },
      { id: "asignaciones-usuarios", label: "Asignar Clientes", icon: Users },
      { id: "mantenimiento-clientes", label: "Clientes", icon: Building2 },
      { id: "mantenimiento-productos", label: "Productos", icon: Package },
      { id: "mantenimiento-categorias", label: "Categorias", icon: Tag },
    ],
  },
]

export function SupervisorSidebar({ currentPage, onNavigate }: SupervisorSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground border-r-2 border-gold transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gold bg-gradient-to-r from-transparent via-gold/5 to-transparent">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gold/20 rounded-lg blur-sm" />
              <div className="relative bg-white rounded-lg p-1 border border-gold">
                <img src="/images/byb-logo.svg" alt="BYB" className="h-8" />
              </div>
            </div>
            <div>
              <span className="font-bold text-sm text-sidebar-foreground">Supervisor</span>
              <span className="text-xs text-gold block">Panel de Control</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-gold/20 hover:text-gold"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {menuItems.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-gold/70 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4 h-px bg-gradient-to-r from-gold/50 to-transparent" />
                  {section.title}
                  <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-gold/10 hover:text-gold transition-all duration-200",
                        collapsed && "justify-center px-2",
                        isActive && "bg-gradient-to-r from-gold/20 via-gold/15 to-transparent text-gold border-l-2 border-gold hover:bg-gold/20 hover:text-gold"
                      )}
                      onClick={() => onNavigate(item.id)}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom decoration */}
      <div className="p-3 border-t-2 border-gold">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-sidebar-foreground/50">BYB Trade Marketing</p>
            <p className="text-xs text-gold">Sistema de Inventarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
