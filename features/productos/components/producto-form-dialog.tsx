"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImagePlus } from "lucide-react"



import type { Producto } from "@/features/productos/types"
import { getProductoImageUrl } from "@/lib/services/productos.service"


const unidades = ["Piezas", "Cajas", "Paquetes", "Kilos", "Litros"]

interface ProductoFormData {
  nombre: string
  sku: string
  categoriaId: string // id numérico como string
  unidad: string
  activo: boolean
  imagen: string
  imageFile: File | null
}

interface ProductoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: ProductoFormData
  setFormData: (data: ProductoFormData) => void
  editingProduct: Producto | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onSave: () => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  categorias: { id: string; nombre: string }[]
}

export function ProductoFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingProduct,
  fileInputRef,
  onSave,
  onImageUpload,
  categorias,
}: ProductoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Modifica los datos del producto"
              : "Ingresa los datos del nuevo producto"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Producto</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.imagen ? (
                <div className="relative aspect-square max-w-[200px] mx-auto">
                  <img
                    src={getProductoImageUrl(formData.imagen)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormData({ ...formData, imagen: "", imageFile: null })
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="py-8">
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG hasta 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageUpload}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Aceite Vegetal 1L"
            />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="Ej: AV-001"
            />
          </div>

          {/* Categoría y Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoriaId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad</Label>
              <Select
                value={formData.unidad}
                onValueChange={(value) =>
                  setFormData({ ...formData, unidad: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="activo">Producto Activo</Label>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, activo: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={!formData.nombre || !formData.sku}
          >
            {editingProduct ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
