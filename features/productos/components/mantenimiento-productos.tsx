"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Pencil, Trash2, Search, ImagePlus, Package } from "lucide-react"
import { useProductoMaintenance } from "../hooks/useProductoMaintenance"

interface MantenimientoProductosProps {
  onBack?: () => void
}

const categorias = [
  "Aceites",
  "Granos",
  "Endulzantes",
  "Harinas",
  "Condimentos",
  "Aderezos",
  "Enlatados",
  "Lácteos",
  "Bebidas",
  "Otros",
]

const unidades = ["Piezas", "Cajas", "Paquetes", "Kilos", "Litros"]

export function MantenimientoProductos({ onBack }: MantenimientoProductosProps) {
  const {
    productos,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingProduct,
    productToDelete,
    fileInputRef,
    handleOpenDialog,
    handleSave,
    handleDeleteClick,
    handleDelete,
    handleImageUpload,
    toggleActivo,
  } = useProductoMaintenance()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">
            {productos.length} productos registrados
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((producto) => (
          <Card
            key={producto.id}
            className={`overflow-hidden ${!producto.activo ? "opacity-60" : ""}`}
          >
            <div className="aspect-square relative bg-muted">
              {producto.imagen ? (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant={producto.activo ? "default" : "secondary"}>
                  {producto.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              {producto.categoria && (
                <Badge
                  variant="outline"
                  className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                >
                  {producto.categoria}
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    SKU: {producto.sku} | {producto.unidad}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={producto.activo}
                      onCheckedChange={() => toggleActivo(producto)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {producto.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(producto)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(producto)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        </Card>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      src={formData.imagen}
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
                        setFormData({ ...formData, imagen: "" })
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
                onChange={handleImageUpload}
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
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.nombre || !formData.sku}
            >
              {editingProduct ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              {`¿Estás seguro de que deseas eliminar "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
