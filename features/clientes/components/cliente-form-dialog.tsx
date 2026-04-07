import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { getImageUrl } from "@/lib/services/clientes.service"

interface ClienteFormData {
  nombre: string
  cliente_code: string
  direccion: string
  contacto: string
  telefono: string
  email: string
  imagen: string
}

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: ClienteFormData
  setFormData: React.Dispatch<React.SetStateAction<ClienteFormData>>
  editingCliente: any
  imagePreview: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent) => void
  onClose: () => void
  onSubmit: () => void
  loading: boolean
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingCliente,
  imagePreview,
  fileInputRef,
  onImageUpload,
  onDrop,
  onClose,
  onSubmit,
  loading,
}: ClienteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onDrop={onDrop}
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
              ) : formData.imagen ? (
                <div className="relative aspect-video">
                  <img
                    src={getImageUrl(formData.imagen)}
                    alt="Actual"
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
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onImageUpload}
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
            <Label htmlFor="cliente_code">Código Cliente</Label>
            <Input
              id="cliente_code"
              value={formData.cliente_code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cliente_code: e.target.value }))
              }
              placeholder="Ej: C123"
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {editingCliente ? "Guardar Cambios" : "Crear Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
// ...existing code...
