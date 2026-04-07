import { useState, useEffect, useCallback } from "react"
import { getUsuarios } from "@/lib/services/usuarios.service"
import { getClientes } from "@/lib/services/clientes.service"
import type { User, UserRole } from "@/features/usuarios/types"
import type { Cliente } from "@/features/clientes/types"

const emptyForm = {
  name: "",
  email: "",
  role: "field" as UserRole,
  imagen: "",
}

export function useUsuarioMaintenance() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [allClientes, setAllClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAsignarDialog, setShowAsignarDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToAsignar, setUserToAsignar] = useState<User | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([])

  useEffect(() => {
    getUsuarios().then(setUsuarios)
    getClientes().then(setAllClientes)
  }, [])

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const usuariosActivos = filteredUsuarios.filter((u) => u.activo)
  const usuariosInactivos = filteredUsuarios.filter((u) => !u.activo)

  const handleOpenDialog = useCallback((user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        imagen: user.imagen || "",
      })
    } else {
      setEditingUser(null)
      setFormData(emptyForm)
    }
    setShowDialog(true)
  }, [])

  const handleSave = useCallback(() => {
    if (editingUser) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                imagen: formData.imagen,
              }
            : u
        )
      )
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        activo: true,
        clientesAsignados: [],
        imagen: formData.imagen,
      }
      setUsuarios((prev) => [...prev, newUser])
    }
    setShowDialog(false)
  }, [formData, editingUser])

  const handleToggleActivo = useCallback((userId: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activo: !u.activo } : u))
    )
  }, [])

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (userToDelete) {
      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setShowDeleteDialog(false)
      setUserToDelete(null)
    }
  }, [userToDelete])

  const handleOpenAsignar = useCallback((user: User) => {
    setUserToAsignar(user)
    setClientesSeleccionados(user.clientesAsignados || [])
    setShowAsignarDialog(true)
  }, [])

  const handleSaveAsignacion = useCallback(() => {
    if (userToAsignar) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userToAsignar.id
            ? { ...u, clientesAsignados: clientesSeleccionados }
            : u
        )
      )
      setShowAsignarDialog(false)
      setUserToAsignar(null)
    }
  }, [userToAsignar, clientesSeleccionados])

  const toggleCliente = useCallback((clienteId: string) => {
    setClientesSeleccionados((prev) =>
      prev.includes(clienteId)
        ? prev.filter((id) => id !== clienteId)
        : [...prev, clienteId]
    )
  }, [])

  const getClienteNombres = useCallback((clienteIds: string[]) => {
    return clienteIds
      .map((id) => allClientes.find((c) => c.id === id)?.nombre)
      .filter(Boolean)
      .join(", ")
  }, [allClientes])

  return {
    usuarios,
    allClientes,
    filteredUsuarios,
    usuariosActivos,
    usuariosInactivos,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    showDialog,
    setShowDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showAsignarDialog,
    setShowAsignarDialog,
    editingUser,
    userToDelete,
    userToAsignar,
    clientesSeleccionados,
    handleOpenDialog,
    handleSave,
    handleToggleActivo,
    handleDeleteClick,
    handleDelete,
    handleOpenAsignar,
    handleSaveAsignacion,
    toggleCliente,
    getClienteNombres,
  }
}
