import type { UserRole } from "@/lib/types"

let currentUserRole: UserRole | null = null

export function setCurrentUserRole(role: UserRole | null) {
  currentUserRole = role
}

export function getCurrentUserRole(): UserRole | null {
  return currentUserRole
}
