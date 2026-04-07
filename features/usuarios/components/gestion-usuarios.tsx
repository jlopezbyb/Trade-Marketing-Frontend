"use client"

import { Button } from "@/components/ui/button"
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
import { Search, Plus } from "lucide-react"
import { useUsuarioMaintenance } from "../hooks/useUsuarioMaintenance"
import { UsuarioCard } from "./usuario-card"
import { UsuarioFormDialog } from "./usuario-form-dialog"
import { AsignarClientesDialog } from "./asignar-clientes-dialog"

export function GestionUsuarios() {
  const {
    allClientes,
    usuariosActivos,
    usuariosInactivos,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    showDialog,
    setShowDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showAsignarDialog,
    setShowAsignarDialog,
    editingUser,
    userToDelete,
    userToAsignar,
    clientesSeleccionados,
    handleOpenDialog,
    handleSave,
    handleToggleActivo,
    handleDeleteClick,
    handleDelete,
    handleOpenAsignar,
    handleSaveAsignacion,
    toggleCliente,
    getClienteNombres,
  } = useUsuarioMaintenance()

  return (
    <div className="space-y-6 px-4 pt-6 sm:px-8 sm:pt-8">
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
            {usuariosActivos.map((user) => (
              <UsuarioCard
                key={user.id}
                user={user}
                onEdit={handleOpenDialog}
                onToggleActivo={handleToggleActivo}
                onAsignarClientes={handleOpenAsignar}
              />
            ))}
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
            {usuariosInactivos.map((user) => (
              <UsuarioCard
                key={user.id}
                user={user}
                onEdit={handleOpenDialog}
                onToggleActivo={handleToggleActivo}
                onAsignarClientes={handleOpenAsignar}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <UsuarioFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        formData={formData}
        setFormData={setFormData}
        editingUser={editingUser}
        onSave={handleSave}
      />

      {/* Assign Clients Dialog */}
      <AsignarClientesDialog
        open={showAsignarDialog}
        onOpenChange={setShowAsignarDialog}
        user={userToAsignar}
        clientes={allClientes}
        clientesSeleccionados={clientesSeleccionados}
        onToggleCliente={toggleCliente}
        onSave={handleSaveAsignacion}
      />

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
