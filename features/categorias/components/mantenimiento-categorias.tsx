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
import { ArrowLeft, Plus, Search, Tag } from "lucide-react"
import { useCategoriaMaintenance } from "../hooks/useCategoriaMaintenance"
import { CategoriaCard, CategoriaInactiveCard } from "./categoria-card"
import { CategoriaFormDialog } from "./categoria-form-dialog"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface MantenimientoCategoriasProps {
  onBack?: () => void
}

export function MantenimientoCategorias({ onBack }: MantenimientoCategoriasProps) {
  const {
    categoriasActivas,
    categoriasInactivas,
    filteredActivas,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingCategoria,
    categoriaToDelete,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
    handleToggleActivo,
    handleDeleteClick,
    handleConfirmDelete,
  } = useCategoriaMaintenance()

  const {
    page: pageActivas,
    pageCount: pageCountActivas,
    items: categoriasActivasPaginadas,
    nextPage: nextActivas,
    prevPage: prevActivas,
    goToPage: goToPageActivas,
  } = usePagination(filteredActivas, 10)

  const {
    page: pageInactivas,
    pageCount: pageCountInactivas,
    items: categoriasInactivasPaginadas,
    nextPage: nextInactivas,
    prevPage: prevInactivas,
    goToPage: goToPageInactivas,
  } = usePagination(categoriasInactivas, 10)

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
          categoriasActivasPaginadas.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={handleOpenEdit}
              onToggleActivo={handleToggleActivo}
            />
          ))
        )}
      </div>

      {filteredActivas.length > 0 && pageCountActivas > 1 && (
        <div className="pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    prevActivas()
                  }}
                />
              </PaginationItem>
              {Array.from({ length: pageCountActivas }).map((_, index) => {
                const pageNumber = index + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === pageActivas}
                      onClick={(e) => {
                        e.preventDefault()
                        goToPageActivas(pageNumber)
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    nextActivas()
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Categorías inactivas */}
      {categoriasInactivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Categorías Inactivas</h3>
          {categoriasInactivasPaginadas.map((categoria) => (
            <CategoriaInactiveCard
              key={categoria.id}
              categoria={categoria}
              onReactivar={handleToggleActivo}
              onDelete={handleDeleteClick}
            />
          ))}

          {categoriasInactivas.length > 0 && pageCountInactivas > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        prevInactivas()
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: pageCountInactivas }).map((_, index) => {
                    const pageNumber = index + 1
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === pageInactivas}
                          onClick={(e) => {
                            e.preventDefault()
                            goToPageInactivas(pageNumber)
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        nextInactivas()
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Dialog para crear/editar */}
      <CategoriaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        editingCategoria={editingCategoria}
        onSave={handleSave}
      />

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
