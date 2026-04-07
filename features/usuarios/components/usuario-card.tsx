"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit2, Users, Building2, UserCheck, UserX } from "lucide-react"
import type { User } from "@/features/usuarios/types"

interface UsuarioCardProps {
  user: User
  onEdit: (user: User) => void
  onToggleActivo: (userId: string) => void
  onAsignarClientes: (user: User) => void
}

export function UsuarioCard({ user, onEdit, onToggleActivo, onAsignarClientes }: UsuarioCardProps) {
  return (
    <Card className={!user.activo ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.imagen} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{user.name}</h3>
              <Badge variant={user.role === "supervisor" ? "default" : "secondary"}>
                {user.role === "supervisor" ? "Supervisor" : "Campo"}
              </Badge>
              {!user.activo && <Badge variant="outline">Inactivo</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.role === "field" && user.clientesAsignados && user.clientesAsignados.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">
                  {user.clientesAsignados.length} cliente(s) asignado(s)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {user.role === "field" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAsignarClientes(user)}
                title="Asignar clientes"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              title="Editar usuario"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActivo(user.id)}
              title={user.activo ? "Desactivar" : "Activar"}
            >
              {user.activo ? (
                <UserX className="h-4 w-4 text-destructive" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
