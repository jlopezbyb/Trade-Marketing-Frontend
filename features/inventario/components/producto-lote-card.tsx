"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, CalendarIcon } from "lucide-react"

interface Lote {
  id: string
  lote: string
  cantidad: number
  fechaVencimiento: string
}

interface ProductoConLotes {
  productoId: string
  productoNombre: string
  sku: string
  unidad: string
  lotes: Lote[]
}

interface ProductoLoteCardProps {
  producto: ProductoConLotes
  subtotal: number
  onEliminarProducto: (productoId: string) => void
  onAgregarLote: (productoId: string) => void
  onEliminarLote: (productoId: string, loteId: string) => void
  onActualizarLote: (productoId: string, loteId: string, field: string, value: string | number) => void
}

export function ProductoLoteCard({
  producto,
  subtotal,
  onEliminarProducto,
  onAgregarLote,
  onEliminarLote,
  onActualizarLote,
}: ProductoLoteCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/50 py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{producto.productoNombre}</CardTitle>
            <p className="text-xs text-muted-foreground">
              SKU: {producto.sku} | {producto.unidad}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-primary text-primary-foreground px-2 py-1 rounded">
              Subtotal: {subtotal}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onEliminarProducto(producto.productoId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {producto.lotes.map((lote) => (
          <div
            key={lote.id}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg"
          >
            <div>
              <Label className="text-xs">Número de Lote</Label>
              <Input
                placeholder="LOT-2026-XXX"
                value={lote.lote}
                onChange={(e) =>
                  onActualizarLote(producto.productoId, lote.id, "lote", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Cantidad</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={lote.cantidad || ""}
                onChange={(e) =>
                  onActualizarLote(
                    producto.productoId,
                    lote.id,
                    "cantidad",
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Fecha de Vencimiento
              </Label>
              <Input
                type="date"
                value={lote.fechaVencimiento}
                onChange={(e) =>
                  onActualizarLote(
                    producto.productoId,
                    lote.id,
                    "fechaVencimiento",
                    e.target.value
                  )
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              {producto.lotes.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onEliminarLote(producto.productoId, lote.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAgregarLote(producto.productoId)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Otro Lote
        </Button>
      </CardContent>
    </Card>
  )
}
