"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Tag, RotateCcw } from "lucide-react"
import type { Categoria } from "@/features/categorias/types"

interface CategoriaCardProps {
  categoria: Categoria
  onEdit: (categoria: Categoria) => void
  onToggleActivo: (categoriaId: string) => void
}

export function CategoriaCard({ categoria, onEdit, onToggleActivo }: CategoriaCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: categoria.color }}
          >
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{categoria.nombre}</h3>
            {categoria.descripcion && (
              <p className="text-sm text-muted-foreground truncate">
                {categoria.descripcion}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(categoria)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Switch
              checked={categoria.activo}
              onCheckedChange={() => onToggleActivo(categoria.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoriaInactiveCardProps {
  categoria: Categoria
  onReactivar: (categoriaId: string) => void
  onDelete: (categoria: Categoria) => void
}

export function CategoriaInactiveCard({ categoria, onReactivar, onDelete }: CategoriaInactiveCardProps) {
  return (
    <Card className="overflow-hidden opacity-60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 grayscale"
            style={{ backgroundColor: categoria.color }}
          >
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{categoria.nombre}</h3>
            {categoria.descripcion && (
              <p className="text-sm text-muted-foreground truncate">
                {categoria.descripcion}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReactivar(categoria.id)}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reactivar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(categoria)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
