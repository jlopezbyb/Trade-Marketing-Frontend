"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, Plus } from "lucide-react"
import { useRegistroInventario } from "../hooks/useRegistroInventario"
import { InventarioSuccessView } from "./inventario-success-view"
import { ProductoLoteCard } from "./producto-lote-card"
import type { Cliente } from "@/features/clientes/types"

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

  // Wrapper para pasar clienteId al hook
  const handleSubmitWithCliente = (e: React.FormEvent) => {
    // @ts-ignore
    handleSubmit(e, cliente.id)
  }

  if (success) {
    return (
      <InventarioSuccessView
        cliente={cliente}
        productosConLotes={productosConLotes}
        calcularSubtotal={calcularSubtotal}
        calcularTotal={calcularTotal}
        onComplete={onComplete}
      />
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

      <form onSubmit={handleSubmitWithCliente} className="flex-1 flex flex-col">
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
            <ProductoLoteCard
              key={producto.productoId}
              producto={producto}
              subtotal={calcularSubtotal(producto)}
              onEliminarProducto={eliminarProducto}
              onAgregarLote={agregarLote}
              onEliminarLote={eliminarLote}
              onActualizarLote={actualizarLote}
            />
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
