"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, MapPin, Phone, User } from "lucide-react"
import { getClientes } from "@/lib/services/clientes.service"
import type { Cliente } from "@/lib/types"

interface ClientesListProps {
  onBack?: () => void
  onSelectCliente: (cliente: Cliente) => void
}

export function ClientesList({ onBack, onSelectCliente }: ClientesListProps) {
  const [search, setSearch] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    getClientes().then(setClientes)
  }, [])

  const filteredClientes = clientes.filter((cliente) =>
    cliente.activo && cliente.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">Selecciona un cliente para registrar visita</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 p-4 space-y-3">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron clientes
          </div>
        ) : (
          filteredClientes.map((cliente) => (
            <Card 
              key={cliente.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
              onClick={() => onSelectCliente(cliente)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{cliente.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" />
                  <span>{cliente.contacto}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
