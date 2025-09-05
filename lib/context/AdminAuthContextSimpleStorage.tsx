"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuthSimpleStorage } from '@/hooks/use-admin-auth-simple-storage'

// =====================================================
// ⚡ CONTEXTO SÚPER SIMPLE - SOLO STORAGE
// =====================================================
// Sin cache complejo, sin verificaciones constantes
// Solo storage local para máxima velocidad
// =====================================================

interface AdminAuthContextType {
  // Estado
  user: any
  profile: any
  isAdmin: boolean
  isAuthenticated: boolean
  isLoading: boolean
  
  // Funciones
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProviderSimpleStorage({ children }: AdminAuthProviderProps) {
  const authData = useAdminAuthSimpleStorage()

  return (
    <AdminAuthContext.Provider value={authData}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuthContextSimpleStorage() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuthContextSimpleStorage debe ser usado dentro de AdminAuthProviderSimpleStorage')
  }
  return context
}

// Hook de conveniencia para componentes que solo necesitan verificar estado
export function useAdminAuthState() {
  const { user, profile, isAdmin, isAuthenticated, isLoading } = useAdminAuthContextSimpleStorage()
  return { user, profile, isAdmin, isAuthenticated, isLoading }
}

// Hook de conveniencia para funciones de autenticación
export function useAdminAuthActions() {
  const { signIn, signOut, refreshAuth } = useAdminAuthContextSimpleStorage()
  return { signIn, signOut, refreshAuth }
}
