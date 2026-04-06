"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { ArrowLeft, Plus, Search, Edit2, Trash2, Upload, Building2, Phone, Mail, MapPin, User } from "lucide-react"
import { mockClientes } from "@/lib/mock-data"
import type { Cliente } from "@/lib/types"

interface MantenimientoClientesProps {
  onBack?: () => void
}

export function MantenimientoClientes({ onBack }: MantenimientoClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    contacto: "",
    email: "",
    imagen: "",
  })

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.activo &&
      (cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const inactiveClientes = clientes.filter((cliente) => !cliente.activo)

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        contacto: cliente.contacto,
        email: cliente.email || "",
        imagen: cliente.imagen || "",
      })
      setImagePreview(cliente.imagen || null)
    } else {
      setEditingCliente(null)
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        contacto: "",
        email: "",
        imagen: "",
      })
      setImagePreview(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCliente(null)
    setImagePreview(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!formData.nombre || !formData.direccion || !formData.telefono || !formData.contacto) {
      return
    }

    if (editingCliente) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editingCliente.id
            ? { ...c, ...formData }
            : c
        )
      )
    } else {
      const newCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
        activo: true,
      }
      setClientes((prev) => [...prev, newCliente])
    }

    handleCloseDialog()
  }

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (clienteToDelete) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteToDelete.id ? { ...c, activo: false } : c
        )
      )
    }
    setIsDeleteDialogOpen(false)
    setClienteToDelete(null)
  }

  const handleReactivate = (cliente: Cliente) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === cliente.id ? { ...c, activo: true } : c
      )
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">Mantenimiento de Clientes</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus clientes</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                  onClick={() => handleOpenDialog(cliente)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDeleteClick(cliente)}
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
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}

      {inactiveClientes.length > 0 && (
        <div className="pt-6 border-t">
          <h3 className="font-semibold text-foreground mb-3">Clientes Inactivos ({inactiveClientes.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveClientes.map((cliente) => (
              <Card key={cliente.id} className="overflow-hidden opacity-60">
                <div className="aspect-video relative bg-muted">
                  {cliente.imagen ? (
                    <img
                      src={cliente.imagen}
                      alt={cliente.nombre}
                      className="w-full h-full object-cover grayscale"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground truncate mb-2">{cliente.nombre}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleReactivate(cliente)}
                  >
                    Reactivar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingCliente
                ? "Modifica los datos del cliente"
                : "Ingresa los datos del nuevo cliente"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Foto del Local</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <div className="relative aspect-video">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clic o arrastra una imagen
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Negocio *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Supermercado El Sol"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, direccion: e.target.value }))
                }
                placeholder="Ej: Av. Principal 123, Col. Centro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto *</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contacto: e.target.value }))
                }
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                  }
                  placeholder="555-123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingCliente ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              El cliente &quot;{clienteToDelete?.nombre}&quot; será marcado como inactivo.
              Podrás reactivarlo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
