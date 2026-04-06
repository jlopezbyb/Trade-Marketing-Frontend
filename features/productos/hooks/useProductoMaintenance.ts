import { useState, useEffect, useRef, useCallback } from "react"
import { getProductos } from "@/lib/services/productos.service"
import type { Producto } from "@/lib/types"

const emptyForm = {
  nombre: "",
  sku: "",
  unidad: "Piezas",
  categoria: "",
  imagen: "",
  activo: true,
}

export function useProductoMaintenance() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    getProductos().then(setProductos)
  }, [])

  const filteredProducts = productos.filter((producto) => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria =
      filterCategoria === "all" || producto.categoria === filterCategoria
    return matchesSearch && matchesCategoria
  })

  const handleOpenDialog = useCallback((producto?: Producto) => {
    if (producto) {
      setEditingProduct(producto)
      setFormData({
        nombre: producto.nombre,
        sku: producto.sku,
        unidad: producto.unidad,
        categoria: producto.categoria || "",
        imagen: producto.imagen || "",
        activo: producto.activo,
      })
    } else {
      setEditingProduct(null)
      setFormData(emptyForm)
    }
    setIsDialogOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!formData.nombre || !formData.sku) return

    if (editingProduct) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...formData } : p
        )
      )
    } else {
      const newProduct: Producto = {
        id: String(Date.now()),
        ...formData,
      }
      setProductos((prev) => [...prev, newProduct])
    }
    setIsDialogOpen(false)
  }, [formData, editingProduct])

  const handleDeleteClick = useCallback((producto: Producto) => {
    setProductToDelete(producto)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (productToDelete) {
      setProductos((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }, [productToDelete])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagen: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const toggleActivo = useCallback((producto: Producto) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === producto.id ? { ...p, activo: !p.activo } : p
      )
    )
  }, [])

  return {
    productos,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingProduct,
    productToDelete,
    fileInputRef,
    handleOpenDialog,
    handleSave,
    handleDeleteClick,
    handleDelete,
    handleImageUpload,
    toggleActivo,
  }
}
