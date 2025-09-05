"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuthOptimized } from '@/hooks/use-admin-auth-optimized'

// =====================================================
// 🚀 CONTEXTO DE AUTENTICACIÓN OPTIMIZADO - ELEVEN RIFAS
// =====================================================
// Contexto unificado que elimina verificaciones redundantes
// Usa el hook optimizado para máximo rendimiento
// =====================================================

interface AdminAuthContextType {
  // Estado
  user: any
  profile: any
  isAdmin: boolean
  isAuthenticated: boolean
  isLoading: boolean
  lastChecked: number
  
  // Funciones
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>
  signOut: () => Promise<void>
  invalidateCache: () => void
  refreshAuth: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProviderOptimized({ children }: AdminAuthProviderProps) {
  const authData = useAdminAuthOptimized()

  return (
    <AdminAuthContext.Provider value={authData}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuthContextOptimized() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuthContextOptimized debe ser usado dentro de AdminAuthProviderOptimized')
  }
  return context
}

// Hook de conveniencia para componentes que solo necesitan verificar estado
export function useAdminAuthState() {
  const { user, profile, isAdmin, isAuthenticated, isLoading } = useAdminAuthContextOptimized()
  return { user, profile, isAdmin, isAuthenticated, isLoading }
}

// Hook de conveniencia para funciones de autenticación
export function useAdminAuthActions() {
  const { signIn, signOut, invalidateCache, refreshAuth } = useAdminAuthContextOptimized()
  return { signIn, signOut, invalidateCache, refreshAuth }
}
