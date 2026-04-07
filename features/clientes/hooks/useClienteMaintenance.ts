import { useState, useEffect, useRef, useCallback } from "react"
import { getClientes } from "@/lib/services/clientes.service"
import type { Cliente } from "@/features/clientes/types"

const emptyForm = {
  nombre: "",
  direccion: "",
  telefono: "",
  contacto: "",
  email: "",
  imagen: "",
}

export function useClienteMaintenance() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    getClientes().then(setClientes)
  }, [])

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.activo &&
      (cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const inactiveClientes = clientes.filter((cliente) => !cliente.activo)

  const handleOpenDialog = useCallback((cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        contacto: cliente.contacto,
        email: cliente.email || "",
        imagen: cliente.imagen || "",
      })
      setImagePreview(cliente.imagen || null)
    } else {
      setEditingCliente(null)
      setFormData(emptyForm)
      setImagePreview(null)
    }
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingCliente(null)
    setImagePreview(null)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (!formData.nombre || !formData.direccion || !formData.telefono || !formData.contacto) {
      return
    }

    if (editingCliente) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editingCliente.id ? { ...c, ...formData } : c
        )
      )
    } else {
      const newCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
        activo: true,
      }
      setClientes((prev) => [...prev, newCliente])
    }

    handleCloseDialog()
  }, [formData, editingCliente, handleCloseDialog])

  const handleDeleteClick = useCallback((cliente: Cliente) => {
    setClienteToDelete(cliente)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (clienteToDelete) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteToDelete.id ? { ...c, activo: false } : c
        )
      )
    }
    setIsDeleteDialogOpen(false)
    setClienteToDelete(null)
  }, [clienteToDelete])

  const handleReactivate = useCallback((cliente: Cliente) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === cliente.id ? { ...c, activo: true } : c
      )
    )
  }, [])

  return {
    // Data
    filteredClientes,
    inactiveClientes,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    // Dialog state
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingCliente,
    clienteToDelete,
    // Image
    imagePreview,
    fileInputRef,
    handleImageUpload,
    handleDrop,
    // Actions
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDeleteClick,
    handleConfirmDelete,
    handleReactivate,
  }
}
