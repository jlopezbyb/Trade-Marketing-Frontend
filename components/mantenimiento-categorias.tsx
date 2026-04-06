"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { ArrowLeft, Plus, Search, Pencil, Trash2, Tag, RotateCcw } from "lucide-react"
import { mockCategorias } from "@/lib/mock-data"
import type { Categoria } from "@/lib/types"

interface MantenimientoCategoriasProps {
  onBack?: () => void
}

const coloresPredefinidos = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", 
  "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#64748b"
]

export function MantenimientoCategorias({ onBack }: MantenimientoCategoriasProps) {
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#22c55e",
  })

  const categoriasActivas = categorias.filter((c) => c.activo)
  const categoriasInactivas = categorias.filter((c) => !c.activo)

  const filteredActivas = categoriasActivas.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenCreate = () => {
    setEditingCategoria(null)
    setFormData({ nombre: "", descripcion: "", color: "#22c55e" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      color: categoria.color,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.nombre.trim()) return

    if (editingCategoria) {
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === editingCategoria.id
            ? {
                ...c,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                color: formData.color,
              }
            : c
        )
      )
    } else {
      const newCategoria: Categoria = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        color: formData.color,
        activo: true,
      }
      setCategorias((prev) => [...prev, newCategoria])
    }

    setIsDialogOpen(false)
    setFormData({ nombre: "", descripcion: "", color: "#22c55e" })
  }

  const handleToggleActivo = (id: string) => {
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    )
  }

  const handleDeleteClick = (categoria: Categoria) => {
    setCategoriaToDelete(categoria)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (categoriaToDelete) {
      setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id))
    }
    setIsDeleteDialogOpen(false)
    setCategoriaToDelete(null)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">Mantenimiento de Categorías</h2>
          <p className="text-sm text-muted-foreground">
            {categoriasActivas.length} activas, {categoriasInactivas.length} inactivas
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva</span>
        </Button>
      </div>

      {/* Categorías activas */}
      <div className="space-y-3">
        {filteredActivas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron categorías</p>
            </CardContent>
          </Card>
        ) : (
          filteredActivas.map((categoria) => (
            <Card key={categoria.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: categoria.color }}
                  >
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{categoria.nombre}</h3>
                    {categoria.descripcion && (
                      <p className="text-sm text-muted-foreground truncate">
                        {categoria.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(categoria)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={categoria.activo}
                      onCheckedChange={() => handleToggleActivo(categoria.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Categorías inactivas */}
      {categoriasInactivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Categorías Inactivas</h3>
          {categoriasInactivas.map((categoria) => (
            <Card key={categoria.id} className="overflow-hidden opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 grayscale"
                    style={{ backgroundColor: categoria.color }}
                  >
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{categoria.nombre}</h3>
                    {categoria.descripcion && (
                      <p className="text-sm text-muted-foreground truncate">
                        {categoria.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActivo(categoria.id)}
                      className="gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reactivar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(categoria)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoria
                ? "Modifica los datos de la categoría"
                : "Completa los datos de la nueva categoría"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Lácteos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la categoría"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {coloresPredefinidos.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="colorCustom" className="text-xs">Personalizado:</Label>
                <Input
                  id="colorCustom"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">{formData.color}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">
                    {formData.nombre || "Nombre de categoría"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.descripcion || "Descripción"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.nombre.trim()}>
              {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;{categoriaToDelete?.nombre}&quot;?
              Esta acción no se puede deshacer. Los productos de esta categoría quedarán sin categoría asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
