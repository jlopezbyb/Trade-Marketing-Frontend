"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Package, CheckCircle, Plus, Trash2, CalendarIcon } from "lucide-react"
import { useRegistroInventario } from "../hooks/useRegistroInventario"
import type { Cliente } from "@/lib/types"

interface RegistroInventarioProps {
  cliente: Cliente
  visitaId: string
  onBack: () => void
  onComplete: () => void
}

export function RegistroInventario({ cliente, visitaId, onBack, onComplete }: RegistroInventarioProps) {
  const {
    productosConLotes,
    productosDisponibles,
    success,
    agregarProducto,
    eliminarProducto,
    agregarLote,
    eliminarLote,
    actualizarLote,
    calcularSubtotal,
    calcularTotal,
    handleSubmit,
  } = useRegistroInventario()

  if (success) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Inventario Guardado</h2>
        </div>

        <Alert className="border-primary bg-primary/10">
          <CheckCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            El inventario ha sido registrado correctamente.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{cliente.nombre}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Productos registrados: {productosConLotes.length}
            </p>
            <div className="space-y-4">
              {productosConLotes.map((producto) => (
                <div key={producto.productoId} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{producto.productoNombre}</span>
                    <span className="font-bold">
                      Subtotal: {calcularSubtotal(producto)} {producto.unidad}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {producto.lotes.map((lote) => (
                      <div key={lote.id} className="flex justify-between">
                        <span>Lote: {lote.lote || "Sin especificar"}</span>
                        <span>
                          {lote.cantidad} uds - Vence: {lote.fechaVencimiento || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total General:</span>
                <span className="text-primary">{calcularTotal()} unidades</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-14 text-lg font-semibold" onClick={onComplete}>
          Volver al Inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Registrar Inventario</h2>
            <p className="text-sm text-muted-foreground">{cliente.nombre}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          {/* Selector de productos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Agregar Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {productosDisponibles.map((producto) => (
                  <Button
                    key={producto.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => agregarProducto(producto.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {producto.nombre}
                  </Button>
                ))}
                {productosDisponibles.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Todos los productos han sido agregados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Productos agregados con lotes */}
          {productosConLotes.map((producto) => (
            <Card key={producto.productoId} className="overflow-hidden">
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
                      Subtotal: {calcularSubtotal(producto)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => eliminarProducto(producto.productoId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {producto.lotes.map((lote, index) => (
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
                          actualizarLote(producto.productoId, lote.id, "lote", e.target.value)
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
                          actualizarLote(
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
                          actualizarLote(
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
                          onClick={() => eliminarLote(producto.productoId, lote.id)}
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
                  onClick={() => agregarLote(producto.productoId)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Otro Lote
                </Button>
              </CardContent>
            </Card>
          ))}

          {productosConLotes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay productos agregados</p>
              <p className="text-sm">Selecciona productos de la lista de arriba</p>
            </div>
          )}
        </div>

        {/* Footer with totals and submit */}
        <div className="sticky bottom-0 bg-background border-t p-4 space-y-3">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total General:</span>
            <span className="text-primary">{calcularTotal()} unidades</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            {productosConLotes.length} producto(s) |{" "}
            {productosConLotes.reduce((sum, p) => sum + p.lotes.length, 0)} lote(s)
          </div>
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold"
            disabled={productosConLotes.length === 0}
          >
            Guardar Inventario
          </Button>
        </div>
      </form>
    </div>
  )
}
