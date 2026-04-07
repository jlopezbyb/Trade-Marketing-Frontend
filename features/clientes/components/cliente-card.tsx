"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Building2, Phone, Mail, MapPin, User } from "lucide-react"
import type { Cliente } from "@/features/clientes/types"

interface ClienteCardProps {
  cliente: Cliente
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}

export function ClienteCard({ cliente, onEdit, onDelete }: ClienteCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-muted">
        {cliente.imagen ? (
          <img
            src={cliente.imagen}
            alt={cliente.nombre}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => onEdit(cliente)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8"
            onClick={() => onDelete(cliente)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground truncate">{cliente.nombre}</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{cliente.direccion}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">{cliente.contacto}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{cliente.telefono}</span>
          </div>
          {cliente.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{cliente.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
