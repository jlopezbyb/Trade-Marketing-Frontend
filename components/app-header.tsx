"use client"

import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function AppHeader() {
  const { user, logout } = useAuth()
  const isSupervisor = user?.role === "supervisor"

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary via-primary to-primary shadow-lg border-b-2 border-gold">
      
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gold/30 rounded-lg blur-sm" />
            <div className="relative bg-white rounded-lg p-1.5 border-2 border-gold">
              <Image
                src="/images/byb-logo.svg"
                alt="BYB Logo"
                width={28}
                height={31}
              />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-primary-foreground">Trade Marketing</h1>
            <p className="text-xs text-gold font-medium">Sistema de Inventarios</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-primary-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
              isSupervisor 
                ? "bg-gradient-to-r from-gold/30 to-gold/20 text-gold border-gold" 
                : "bg-primary-foreground/20 text-primary-foreground border-gold/50"
            }`}>
              {isSupervisor ? "Supervisor" : "Campo"}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-primary-foreground hover:bg-gold/20 hover:text-gold transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Cerrar sesion</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
