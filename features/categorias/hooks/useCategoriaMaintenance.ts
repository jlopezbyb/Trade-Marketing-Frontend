import { useState, useEffect, useCallback } from "react"
import { getCategorias } from "@/lib/services/categorias.service"
import type { Categoria } from "@/lib/types"

const emptyForm = {
  nombre: "",
  descripcion: "",
  color: "#22c55e",
}

export function useCategoriaMaintenance() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    getCategorias().then(setCategorias)
  }, [])

  const categoriasActivas = categorias.filter((c) => c.activo)
  const categoriasInactivas = categorias.filter((c) => !c.activo)

  const filteredActivas = categoriasActivas.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenCreate = useCallback(() => {
    setEditingCategoria(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }, [])

  const handleOpenEdit = useCallback((categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      color: categoria.color,
    })
    setIsDialogOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!formData.nombre.trim()) return

    if (editingCategoria) {
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === editingCategoria.id
            ? {
                ...c,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                color: formData.color,
              }
            : c
        )
      )
    } else {
      const newCategoria: Categoria = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        color: formData.color,
        activo: true,
      }
      setCategorias((prev) => [...prev, newCategoria])
    }

    setIsDialogOpen(false)
    setFormData(emptyForm)
  }, [formData, editingCategoria])

  const handleToggleActivo = useCallback((id: string) => {
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    )
  }, [])

  const handleDeleteClick = useCallback((categoria: Categoria) => {
    setCategoriaToDelete(categoria)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (categoriaToDelete) {
      setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id))
    }
    setIsDeleteDialogOpen(false)
    setCategoriaToDelete(null)
  }, [categoriaToDelete])

  return {
    categorias,
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
  }
}
