import type { Visita } from "@/lib/types"
import { mockVisitas } from "@/lib/mock-data"

export async function getVisitas(): Promise<Visita[]> {
  // TODO: reemplazar con GET /api/v1/visitas
  return mockVisitas
}

export async function getVisitasByUsuario(usuarioId: string): Promise<Visita[]> {
  // TODO: reemplazar con GET /api/v1/visitas?usuarioId=
  return mockVisitas.filter((v) => v.usuarioId === usuarioId)
}

export async function createVisita(data: Omit<Visita, "id">): Promise<Visita> {
  // TODO: reemplazar con POST /api/v1/visitas
  const nueva: Visita = { ...data, id: String(Date.now()) }
  mockVisitas.push(nueva)
  return nueva
}
