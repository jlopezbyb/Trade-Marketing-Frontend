"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { Cliente } from "@/features/clientes/types"

interface ProductoConLotes {
  productoId: string
  productoNombre: string
  sku: string
  unidad: string
  lotes: { id: string; lote: string; cantidad: number; fechaVencimiento: string }[]
}

interface InventarioSuccessViewProps {
  cliente: Cliente
  productosConLotes: ProductoConLotes[]
  calcularSubtotal: (producto: ProductoConLotes) => number
  calcularTotal: () => number
  onComplete: () => void
}

export function InventarioSuccessView({
  cliente,
  productosConLotes,
  calcularSubtotal,
  calcularTotal,
  onComplete,
}: InventarioSuccessViewProps) {
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
