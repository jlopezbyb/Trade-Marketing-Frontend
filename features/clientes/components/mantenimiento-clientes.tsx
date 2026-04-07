"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ArrowLeft, Plus, Search, Building2 } from "lucide-react"
import { useClienteMaintenance } from "../hooks/useClienteMaintenance"
import { getImageUrl } from "@/lib/services/clientes.service"
import { ClienteCard } from "./cliente-card"
import { ClienteFormDialog } from "./cliente-form-dialog"

interface MantenimientoClientesProps {
  onBack?: () => void
}

export function MantenimientoClientes({ onBack }: MantenimientoClientesProps) {
  const {
    filteredClientes,
    inactiveClientes,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingCliente,
    clienteToDelete,
    imagePreview,
    fileInputRef,
    handleImageUpload,
    handleDrop,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDeleteClick,
    handleConfirmDelete,
    handleReactivate,
    loading
  } = useClienteMaintenance()

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
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
          />
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
                      src={getImageUrl(cliente.imagen)}
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
      <ClienteFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        editingCliente={editingCliente}
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        onImageUpload={handleImageUpload}
        onDrop={handleDrop}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        loading={loading}
      />

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
