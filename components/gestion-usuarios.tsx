"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit2, Trash2, Users, Building2, UserCheck, UserX } from "lucide-react"
import { mockUsers, mockClientes } from "@/lib/mock-data"
import type { User, Cliente, UserRole } from "@/lib/types"

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAsignarDialog, setShowAsignarDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToAsignar, setUserToAsignar] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "field" as UserRole,
    imagen: "",
  })

  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([])

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const usuariosActivos = filteredUsuarios.filter((u) => u.activo)
  const usuariosInactivos = filteredUsuarios.filter((u) => !u.activo)

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        imagen: user.imagen || "",
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        role: "field",
        imagen: "",
      })
    }
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingUser) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                imagen: formData.imagen,
              }
            : u
        )
      )
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        activo: true,
        clientesAsignados: [],
        imagen: formData.imagen,
      }
      setUsuarios((prev) => [...prev, newUser])
    }
    setShowDialog(false)
  }

  const handleToggleActivo = (userId: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activo: !u.activo } : u))
    )
  }

  const handleDelete = () => {
    if (userToDelete) {
      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setShowDeleteDialog(false)
      setUserToDelete(null)
    }
  }

  const handleOpenAsignar = (user: User) => {
    setUserToAsignar(user)
    setClientesSeleccionados(user.clientesAsignados || [])
    setShowAsignarDialog(true)
  }

  const handleSaveAsignacion = () => {
    if (userToAsignar) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userToAsignar.id
            ? { ...u, clientesAsignados: clientesSeleccionados }
            : u
        )
      )
      setShowAsignarDialog(false)
      setUserToAsignar(null)
    }
  }

  const toggleCliente = (clienteId: string) => {
    setClientesSeleccionados((prev) =>
      prev.includes(clienteId)
        ? prev.filter((id) => id !== clienteId)
        : [...prev, clienteId]
    )
  }

  const getClienteNombres = (clienteIds: string[]) => {
    return clienteIds
      .map((id) => mockClientes.find((c) => c.id === id)?.nombre)
      .filter(Boolean)
      .join(", ")
  }

  const renderUserCard = (user: User) => (
    <Card key={user.id} className={!user.activo ? "opacity-60" : ""}>
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
                onClick={() => handleOpenAsignar(user)}
                title="Asignar clientes"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDialog(user)}
              title="Editar usuario"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleActivo(user.id)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra usuarios y asigna clientes</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Users */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">
          Usuarios Activos ({usuariosActivos.length})
        </h3>
        {usuariosActivos.length > 0 ? (
          <div className="grid gap-3">
            {usuariosActivos.map(renderUserCard)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay usuarios activos
          </p>
        )}
      </div>

      {/* Inactive Users */}
      {usuariosInactivos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-muted-foreground">
            Usuarios Inactivos ({usuariosInactivos.length})
          </h3>
          <div className="grid gap-3">
            {usuariosInactivos.map(renderUserCard)}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Modifica los datos del usuario"
                : "Completa los datos para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nombre completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: María García"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@byb.com"
              />
            </div>

            <div>
              <Label>Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field">Usuario de Campo</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>URL de imagen (opcional)</Label>
              <Input
                value={formData.imagen}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
              {editingUser ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Clients Dialog */}
      <Dialog open={showAsignarDialog} onOpenChange={setShowAsignarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Clientes</DialogTitle>
            <DialogDescription>
              Selecciona los clientes para {userToAsignar?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {mockClientes
              .filter((c) => c.activo)
              .map((cliente) => (
                <Card
                  key={cliente.id}
                  className={`cursor-pointer transition-colors ${
                    clientesSeleccionados.includes(cliente.id)
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => toggleCliente(cliente.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Checkbox
                      checked={clientesSeleccionados.includes(cliente.id)}
                      onCheckedChange={() => toggleCliente(cliente.id)}
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
            <Button variant="outline" onClick={() => setShowAsignarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAsignacion}>
              Guardar ({clientesSeleccionados.length} seleccionados)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {userToDelete?.name}. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
