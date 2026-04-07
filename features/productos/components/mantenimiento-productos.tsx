"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ArrowLeft, Plus, Search, Package } from "lucide-react"
import { useProductoMaintenance } from "../hooks/useProductoMaintenance"
import { ProductoCard } from "./producto-card"
import { ProductoFormDialog } from "./producto-form-dialog"

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
          <ProductoCard
            key={producto.id}
            producto={producto}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
            onToggleActivo={toggleActivo}
          />
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
      <ProductoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        editingProduct={editingProduct}
        fileInputRef={fileInputRef}
        onSave={handleSave}
        onImageUpload={handleImageUpload}
      />

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
