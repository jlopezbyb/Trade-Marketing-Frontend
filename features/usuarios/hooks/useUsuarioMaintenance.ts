import { useState, useEffect, useCallback, useMemo } from "react"
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  assignClientesToUsuario,
} from "@/lib/services/usuarios.service"
import { getClientes } from "@/lib/services/clientes.service"
import type { User, UserRole } from "@/features/usuarios/types"
import type { Cliente } from "@/features/clientes/types"
import { toast } from "sonner"
import { isPermissionError } from "@/lib/permissions"

const emptyForm = {
  name: "",
  email: "",
  role: "field" as UserRole,
  imagen: "",
  employeeCode: "",
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

  const filteredUsuarios = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [usuarios, searchTerm]
  )

  const usuariosActivos = useMemo(
    () => filteredUsuarios.filter((u) => u.activo),
    [filteredUsuarios]
  )
  const usuariosInactivos = useMemo(
    () => filteredUsuarios.filter((u) => !u.activo),
    [filteredUsuarios]
  )

  const handleOpenDialog = useCallback((user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        imagen: user.imagen || "",
        employeeCode: user.employeeCode || "",
      })
    } else {
      setEditingUser(null)
      setFormData(emptyForm)
    }
    setShowDialog(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.employeeCode) return

    try {
      if (editingUser) {
        const updated = await updateUsuario(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          imagen: formData.imagen,
          employeeCode: formData.employeeCode,
        })
        setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        toast.success("Usuario actualizado correctamente")
      } else {
        const nuevo = await createUsuario({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          activo: true,
          clientesAsignados: [],
          imagen: formData.imagen || undefined,
          employeeCode: formData.employeeCode,
        } as Omit<User, "id">)
        setUsuarios((prev) => [...prev, nuevo])
        toast.success("Usuario creado correctamente")
      }
      setShowDialog(false)
    } catch (e: any) {
      if (isPermissionError(e)) {
        toast.error("No tienes permisos para administrar usuarios.")
      } else {
        toast.error("Error al guardar el usuario" + (e?.message ? ": " + e.message : ""))
      }
    }
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

  const handleDelete = useCallback(async () => {
    if (!userToDelete) return

    try {
      await deleteUsuario(userToDelete.id)
      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id))
      toast.success("Usuario eliminado correctamente")
    } catch (e: any) {
      if (isPermissionError(e)) {
        toast.error("No tienes permisos para eliminar usuarios.")
      } else {
        toast.error("Error al eliminar el usuario" + (e?.message ? ": " + e.message : ""))
      }
    } finally {
      setShowDeleteDialog(false)
      setUserToDelete(null)
    }
  }, [userToDelete])

  const handleOpenAsignar = useCallback((user: User) => {
    setUserToAsignar(user)
    setClientesSeleccionados(user.clientesAsignados || [])
    setShowAsignarDialog(true)
  }, [])

  const handleSaveAsignacion = useCallback(async () => {
    if (!userToAsignar) return

    try {
      await assignClientesToUsuario(userToAsignar.id, clientesSeleccionados)
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userToAsignar.id
            ? { ...u, clientesAsignados: clientesSeleccionados }
            : u
        )
      )
      toast.success("Asignaciones actualizadas correctamente")
      setShowAsignarDialog(false)
      setUserToAsignar(null)
    } catch (e: any) {
      if (isPermissionError(e)) {
        toast.error("No tienes permisos para asignar clientes.")
      } else {
        toast.error("Error al asignar clientes" + (e?.message ? ": " + e.message : ""))
      }
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
