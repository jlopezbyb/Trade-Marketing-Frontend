"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tag } from "lucide-react"
import type { Categoria } from "@/features/categorias/types"

const coloresPredefinidos = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#64748b"
]

interface CategoriaFormData {
  nombre: string
  descripcion: string
  color: string
}

interface CategoriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CategoriaFormData
  setFormData: (data: CategoriaFormData) => void
  editingCategoria: Categoria | null
  onSave: () => void
}

export function CategoriaFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingCategoria,
  onSave,
}: CategoriaFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={!formData.nombre.trim()}>
            {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
