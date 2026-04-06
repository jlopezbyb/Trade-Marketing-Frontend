"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contrasena")
      return
    }

    const success = await login(email, password)
    if (success) {
      onSuccess()
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gold-light/20 p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-primary to-gold" />
      
      <Card className="w-full max-w-md border-2 border-gold shadow-xl shadow-gold/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center relative">
            <div className="absolute -inset-4 bg-gold/10 rounded-full blur-xl" />
            <div className="relative bg-white rounded-2xl p-4 shadow-lg border border-gold/20">
              <Image
                src="/images/byb-logo.svg"
                alt="BYB Logo"
                width={100}
                height={110}
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-gold-dark to-foreground bg-clip-text text-transparent">
              Trade Marketing
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Inventarios Premium
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base border-gold/20 focus:border-gold focus:ring-gold/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base border-gold/20 focus:border-gold focus:ring-gold/30"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary hover:from-primary hover:via-gold-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-gold/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesion...
                </>
              ) : (
                "Iniciar Sesion"
              )}
            </Button>

            <div className="mt-6 p-4 bg-gradient-to-br from-muted to-gold-light/10 rounded-lg border border-gold/10">
              <p className="text-sm text-muted-foreground text-center mb-2">
                <strong className="text-gold-dark">Credenciales de prueba:</strong>
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Usuario de campo:</strong> campo@byb.com / demo123</p>
                <p><strong>Supervisor:</strong> supervisor@byb.com / demo123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
