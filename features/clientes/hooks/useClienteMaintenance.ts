import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { getClientes, createCliente, updateCliente, deleteCliente, getImageUrl } from "@/lib/services/clientes.service"
import { toast } from "sonner"
import type { Cliente } from "@/features/clientes/types"

const emptyForm = {
  nombre: "",
  cliente_code: "",
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
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getClientes().then(setClientes)
  }, [])

  const filteredClientes = useMemo(
    () =>
      clientes.filter(
        (cliente) =>
          cliente.activo &&
          (cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [clientes, searchTerm]
  )

  const inactiveClientes = useMemo(
    () => clientes.filter((cliente) => !cliente.activo),
    [clientes]
  )

  const handleOpenDialog = useCallback((cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        cliente_code: cliente.cliente_code || "",
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        contacto: cliente.contacto,
        email: cliente.email || "",
        imagen: cliente.imagen || "",
      })
      setImagePreview(cliente.imagen ? getImageUrl(cliente.imagen) : null)
      setImagenFile(null)
    } else {
      setEditingCliente(null)
      setFormData(emptyForm)
      setImagePreview(null)
      setImagenFile(null)
    }
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingCliente(null)
    setImagePreview(null)
    setImagenFile(null)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Solo JPG, PNG o WEBP.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el tamaño máximo de 5MB.")
      return
    }
    setImagenFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Solo JPG, PNG o WEBP.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el tamaño máximo de 5MB.")
      return
    }
    setImagenFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.nombre || !formData.direccion || !formData.telefono || !formData.contacto) {
      toast.error("Completa todos los campos obligatorios.")
      return
    }
    setLoading(true)
    try {
      const data = new FormData()
      data.append("nombre", formData.nombre)
      data.append("cliente_code", formData.cliente_code)
      data.append("direccion", formData.direccion)
      data.append("telefono", formData.telefono)
      data.append("contacto", formData.contacto)
      data.append("email", formData.email)
      if (imagenFile) {
        data.append("imagen", imagenFile)
      }
      let cliente: Cliente
      if (editingCliente) {
        cliente = await updateCliente(editingCliente.id, data)
        setClientes((prev) => prev.map((c) => c.id === cliente.id ? cliente : c))
        toast.success("Cliente actualizado correctamente")
      } else {
        cliente = await createCliente(data)
        setClientes((prev) => [...prev, cliente])
        toast.success("Cliente creado correctamente")
      }
      handleCloseDialog()
    } catch (e: any) {
      if (e.message?.includes("INVALID_FILE_TYPE")) {
        toast.error("Tipo de archivo no permitido. Solo JPG, PNG o WEBP.")
      } else if (e.message?.includes("INVALID_FILE_SIZE")) {
        toast.error("El archivo supera el tamaño máximo de 5MB.")
      } else if (e.message?.includes("INVALID_FILE_FIELD")) {
        toast.error("Campo de archivo inválido.")
      } else {
        toast.error("Error al guardar el cliente" + (e?.message ? ": " + e.message : ""))
      }
    } finally {
      setLoading(false)
    }
  }, [formData, imagenFile, editingCliente, handleCloseDialog])

  const handleDeleteClick = useCallback((cliente: Cliente) => {
    setClienteToDelete(cliente)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (clienteToDelete) {
      try {
        await deleteCliente(clienteToDelete.id)
        setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id))
        toast.success("Cliente eliminado correctamente")
      } catch (e: any) {
        toast.error("Error al eliminar el cliente" + (e?.message ? ": " + e.message : ""))
      }
    }
    setIsDeleteDialogOpen(false)
    setClienteToDelete(null)
  }, [clienteToDelete])

  const handleReactivate = useCallback((cliente: Cliente) => {
    // Si tienes endpoint para reactivar, llama aquí
    setClientes((prev) =>
      prev.map((c) =>
        c.id === cliente.id ? { ...c, activo: true } : c
      )
    )
  }, [])

  return {
    filteredClientes,
    inactiveClientes,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingCliente,
    clienteToDelete,
    imagePreview,
    fileInputRef,
    handleImageUpload,
    handleDrop,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDeleteClick,
    handleConfirmDelete,
    handleReactivate,
    loading,
  }
}

