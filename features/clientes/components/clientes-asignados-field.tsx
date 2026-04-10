"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, MapPin, Phone, User as UserIcon } from "lucide-react"
import type { Cliente } from "@/features/clientes/types"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth-context"
import { getUsuarioClientes } from "@/lib/services/usuarios.service"

interface ClientesAsignadosFieldProps {
  onBack?: () => void
  onSelectCliente: (cliente: Cliente) => void
}

export function ClientesAsignadosField({ onBack, onSelectCliente }: ClientesAsignadosFieldProps) {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    if (!user) return
    getUsuarioClientes(user.id)
      .then(setClientes)
      .catch(() => {
        setClientes([])
      })
  }, [user])

  const filteredClientes = useMemo(
    () =>
      clientes.filter(
        (cliente) =>
          cliente.activo && cliente.nombre.toLowerCase().includes(search.toLowerCase())
      ),
    [clientes, search]
  )

  const {
    page,
    pageCount,
    items: pagedClientes,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredClientes, 10)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">Mis clientes asignados</h2>
            <p className="text-sm text-muted-foreground">
              Lista de clientes asignados a tu usuario
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente asignado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 p-4 space-y-3">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tienes clientes asignados
          </div>
        ) : (
          pagedClientes.map((cliente) => (
            <Card
              key={cliente.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
              onClick={() => onSelectCliente(cliente)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{cliente.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4 shrink-0" />
                  <span>{cliente.contacto}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {filteredClientes.length > 0 && pageCount > 1 && (
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
      </div>
    </div>
  )
}
