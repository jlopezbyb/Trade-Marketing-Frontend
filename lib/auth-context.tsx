"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, UserRole } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock passwords for demo
const mockPasswords: Record<string, string> = {
  "campo@byb.com": "demo123",
  "supervisor@byb.com": "demo123",
  "campo2@byb.com": "demo123",
  "campo3@byb.com": "demo123",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.activo
    )
    const expectedPassword = mockPasswords[email.toLowerCase()]
    
    if (foundUser && expectedPassword === password) {
      setUser(foundUser)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
