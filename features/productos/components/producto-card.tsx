"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Package } from "lucide-react"
import { getProductoImageUrl } from "@/lib/utils"
import type { Producto } from "@/features/productos/types"

interface ProductoCardProps {
  producto: Producto
  onEdit: (producto: Producto) => void
  onDelete: (producto: Producto) => void
  onToggleActivo: (producto: Producto) => void
}

export function ProductoCard({ producto, onEdit, onDelete, onToggleActivo }: ProductoCardProps) {
  return (
    <Card className={`overflow-hidden ${!producto.activo ? "opacity-60" : ""}`}>
      <div className="aspect-square relative bg-muted">
        {producto.imagen ? (
          <img
            src={getProductoImageUrl(producto.imagen)}
            alt={producto.nombre}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant={producto.activo ? "default" : "secondary"}>
            {producto.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        {producto.categoria && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
          >
            {producto.categoria}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">
              {producto.nombre}
            </h3>
            <p className="text-sm text-muted-foreground">
              SKU: {producto.sku} | {producto.unidad}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={producto.activo}
                onCheckedChange={() => onToggleActivo(producto)}
              />
              <span className="text-xs text-muted-foreground">
                {producto.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(producto)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(producto)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
