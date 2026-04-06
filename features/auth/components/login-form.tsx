"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { loginWithEntraId, isLoading } = useAuth()
  const [error, setError] = useState("")

  const handleEntraIdLogin = async () => {
    setError("")
    const success = await loginWithEntraId()
    if (success) {
      onSuccess()
    } else {
      setError("No se pudo iniciar sesion con Microsoft. Intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gold-light/20 p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-primary to-gold" />
      
      <Card className="w-full max-w-md border-2 border-gold shadow-xl shadow-gold/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <CardHeader className="text-center space-y-4 pt-12 pb-8">
          <div className="flex justify-center relative">
            <div className="absolute -inset-4 bg-gold/10 rounded-full blur-xl" />
            <div className="relative bg-white rounded-2xl p-5 shadow-lg border border-gold/20">
              <Image
                src="/images/byb-logo.svg"
                alt="BYB Logo"
                width={120}
                height={132}
                priority
              />
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-gold-dark to-foreground bg-clip-text text-transparent">
              Trade Marketing
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Sistema de Inventarios Trade Marketing
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-12 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="px-4">
            <Button
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary hover:from-primary hover:via-gold-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-gold/25 gap-3"
              disabled={isLoading}
              onClick={handleEntraIdLogin}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesion...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  Iniciar con Microsoft
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-6">
            Inicia sesion con tu cuenta corporativa de Microsoft
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
