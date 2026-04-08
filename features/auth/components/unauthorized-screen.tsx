"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock } from "lucide-react"

interface UnauthorizedScreenProps {
  onBack?: () => void
}

export function UnauthorizedScreen({ onBack }: UnauthorizedScreenProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <Card className="w-full max-w-md border-gold/40 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pb-4">
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-gold/20 blur-md" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background border-2 border-gold">
              <Lock className="h-8 w-8 text-gold" />
            </div>
          </div>
          <img src="/images/byb-logo.svg" alt="BYB" className="h-10" />
          <CardTitle className="text-center">Sin permisos</CardTitle>
          <CardDescription className="text-center">
            {user
              ? "No tienes permisos para acceder a esta sección."
              : "Debes iniciar sesión para acceder a esta sección."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Si crees que esto es un error, contacta a tu supervisor o al administrador del sistema.
          </p>
          {onBack && (
            <Button className="w-full" onClick={onBack}>
              Volver al inicio
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
