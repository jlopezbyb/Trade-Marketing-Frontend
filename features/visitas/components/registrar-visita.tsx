"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getMe } from "@/lib/api-client"
// Utilidad para leer cookies
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
import { createVisita } from "@/lib/services/visitas.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, MapPin, CheckCircle } from "lucide-react"
import type { Cliente } from "@/features/clientes/types"

interface RegistrarVisitaProps {
  cliente: Cliente
  onBack: () => void
  onContinue: (visitaId: string) => void
}


export function RegistrarVisita({ cliente, onBack, onContinue }: RegistrarVisitaProps) {
  const { user } = useAuth()
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [observaciones, setObservaciones] = useState("")
  const [success, setSuccess] = useState(false)
  const [visitaId, setVisitaId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const me = await getMe()
      const usuarioId = me?.id ? String(me.id) : undefined
      if (!usuarioId || usuarioId === "0" || isNaN(Number(usuarioId))) {
        setError("No se encontró un id de usuario válido (auth/me).")
        return
      }
      const visita = await createVisita({
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        fecha,
        observaciones,
        usuarioId,
      })
      setVisitaId(visita.id)
      setSuccess(true)
    } catch (err) {
      setError("Error al registrar la visita. Intenta de nuevo.")
    }
  }
  if (success && visitaId) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Visita Registrada</h2>
        </div>

        <Alert className="border-primary bg-primary/10">
          <CheckCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            La visita ha sido registrada correctamente.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{cliente.nombre}</CardTitle>
            <CardDescription>{fecha}</CardDescription>
          </CardHeader>
          <CardContent>
            {observaciones && (
              <p className="text-muted-foreground">{observaciones}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            className="w-full h-14 text-lg font-semibold"
            onClick={() => onContinue(visitaId)}
          >
            Registrar Inventario
          </Button>
          <Button 
            variant="outline"
            className="w-full h-12"
            onClick={onBack}
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Nueva Visita</h2>
          <p className="text-sm text-muted-foreground">Registra los datos de la visita</p>
        </div>
      </div>

      {/* Client Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{cliente.direccion}</span>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-base text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Visit Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de Visita</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones (opcional)</Label>
          <Textarea
            id="observaciones"
            placeholder="Notas sobre la visita..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={4}
            className="text-base"
          />
        </div>

        <Button 
          type="submit"
          className="w-full h-14 text-lg font-semibold"
        >
          Guardar Visita
        </Button>
      </form>
    </div>
  )
}
