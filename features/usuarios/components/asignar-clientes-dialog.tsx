"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { User } from "@/features/usuarios/types"
import type { Cliente } from "@/features/clientes/types"

interface AsignarClientesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  clientes: Cliente[]
  clientesSeleccionados: string[]
  onToggleCliente: (clienteId: string) => void
  onSave: () => void
}

export function AsignarClientesDialog({
  open,
  onOpenChange,
  user,
  clientes,
  clientesSeleccionados,
  onToggleCliente,
  onSave,
}: AsignarClientesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Clientes</DialogTitle>
          <DialogDescription>
            Selecciona los clientes para {user?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {clientes
            .filter((c) => c.activo)
            .map((cliente) => (
              <Card
                key={cliente.id}
                className={`cursor-pointer transition-colors ${
                  clientesSeleccionados.includes(cliente.id)
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => onToggleCliente(cliente.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Checkbox
                    checked={clientesSeleccionados.includes(cliente.id)}
                    onCheckedChange={() => onToggleCliente(cliente.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={cliente.imagen} alt={cliente.nombre} />
                    <AvatarFallback>{cliente.nombre[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.direccion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            Guardar ({clientesSeleccionados.length} seleccionados)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
