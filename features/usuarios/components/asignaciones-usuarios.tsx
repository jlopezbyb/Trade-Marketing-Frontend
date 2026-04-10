"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Search } from "lucide-react"
import { useUsuarioMaintenance } from "../hooks/useUsuarioMaintenance"
import { AsignarClientesDialog } from "./asignar-clientes-dialog"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function AsignacionesUsuarios() {
  const {
    allClientes,
    usuariosActivos,
    searchTerm,
    setSearchTerm,
    showAsignarDialog,
    setShowAsignarDialog,
    userToAsignar,
    clientesSeleccionados,
    handleOpenAsignar,
    handleSaveAsignacion,
    toggleCliente,
    getClienteNombres,
  } = useUsuarioMaintenance()

  const usuariosCampo = useMemo(
    () => usuariosActivos.filter((u) => u.role === "field"),
    [usuariosActivos]
  )

  const usuariosFiltrados = useMemo(
    () =>
      usuariosCampo.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [usuariosCampo, searchTerm]
  )

  const {
    page,
    pageCount,
    items: usuariosPaginados,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(usuariosFiltrados, 8)

  return (
    <div className="space-y-6 px-4 pt-6 sm:px-8 sm:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Asignación de Clientes</h2>
          <p className="text-muted-foreground">
            Administra los clientes asignados a cada agente de campo
          </p>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Empleados de campo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuariosFiltrados.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No hay usuarios de campo para mostrar
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Clientes asignados</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosPaginados.map((user) => {
                    const ids = user.clientesAsignados ?? []
                    const detalle = ids.length > 0 ? getClienteNombres(ids) : "Sin clientes asignados"

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">
                          {ids.length} cliente(s)
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <span title={detalle}>{detalle}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAsignar(user)}
                          >
                            Asignar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {usuariosFiltrados.length > 0 && pageCount > 1 && (
                <div className="pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            prevPage()
                          }}
                        />
                      </PaginationItem>
                      {Array.from({ length: pageCount }).map((_, index) => {
                        const pageNumber = index + 1
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={pageNumber === page}
                              onClick={(e) => {
                                e.preventDefault()
                                goToPage(pageNumber)
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
                            nextPage()
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AsignarClientesDialog
        open={showAsignarDialog}
        onOpenChange={setShowAsignarDialog}
        user={userToAsignar}
        clientes={allClientes}
        clientesSeleccionados={clientesSeleccionados}
        onToggleCliente={toggleCliente}
        onSave={handleSaveAsignacion}
      />
    </div>
  )
}
