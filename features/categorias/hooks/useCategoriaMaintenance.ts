import { useState, useEffect, useCallback, useMemo } from "react"
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "@/lib/services/categorias.service"
import { toast } from "sonner"
import type { Categoria } from "@/features/categorias/types"

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

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.activo),
    [categorias]
  )
  const categoriasInactivas = useMemo(
    () => categorias.filter((c) => !c.activo),
    [categorias]
  )

  const filteredActivas = useMemo(
    () =>
      categoriasActivas.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [categoriasActivas, searchTerm]
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

  const handleSave = useCallback(async () => {
    if (!formData.nombre.trim()) return

    try {
      if (editingCategoria) {
        // PUT
        const updated = await updateCategoria(editingCategoria.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          color: formData.color,
        })
        setCategorias((prev) => prev.map((c) => c.id === updated.id ? updated : c))
        toast.success("Categoría actualizada correctamente")
      } else {
        // POST
        const nueva = await createCategoria({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          color: formData.color,
          activo: true,
        })
        setCategorias((prev) => [...prev, nueva])
        toast.success("Categoría creada correctamente")
      }
    } catch (e: any) {
      toast.error("Error al guardar la categoría" + (e?.message ? ": " + e.message : ""))
      return
    }
    setIsDialogOpen(false)
    setFormData(emptyForm)
  }, [formData, editingCategoria])

  const handleToggleActivo = useCallback(async (id: string) => {
    const categoria = categorias.find((c) => c.id === id)
    if (!categoria) return
    try {
      const updated = await updateCategoria(id, { activo: !categoria.activo })
      setCategorias((prev) => prev.map((c) => c.id === id ? updated : c))
      toast.success("Estado actualizado")
    } catch (e: any) {
      toast.error("Error al actualizar estado" + (e?.message ? ": " + e.message : ""))
    }
  }, [categorias])

  const handleDeleteClick = useCallback((categoria: Categoria) => {
    setCategoriaToDelete(categoria)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (categoriaToDelete) {
      try {
        await deleteCategoria(categoriaToDelete.id)
        setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id))
        toast.success("Categoría eliminada")
      } catch (e: any) {
        toast.error("Error al eliminar la categoría" + (e?.message ? ": " + e.message : ""))
      }
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
