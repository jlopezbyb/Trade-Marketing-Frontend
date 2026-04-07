"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react"
import { getVisitas } from "@/lib/services/visitas.service"
import type { Visita } from "@/features/visitas/types"
import { usePagination } from "@/hooks/usePagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface HistorialVisitasProps {
  onBack?: () => void
}

export function HistorialVisitas({ onBack }: HistorialVisitasProps) {
  const [visitas, setVisitas] = useState<Visita[]>([])

  useEffect(() => {
    getVisitas().then(setVisitas)
  }, [])

  const { page, pageCount, items: visitasPaginadas, nextPage, prevPage, goToPage } = usePagination(
    visitas,
    10
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">Historial de Visitas</h2>
            <p className="text-sm text-muted-foreground">Tus visitas recientes</p>
          </div>
        </div>
      </div>

      {/* Visit List */}
      <div className="flex-1 p-4 space-y-3">
        {visitas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay visitas registradas
          </div>
        ) : (
          visitasPaginadas.map((visita) => (
            <Card key={visita.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{visita.clienteNombre}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{visita.fecha}</span>
                  </div>
                </div>
              </CardHeader>
              {visita.observaciones && (
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{visita.observaciones}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}

        {visitas.length > 0 && pageCount > 1 && (
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
