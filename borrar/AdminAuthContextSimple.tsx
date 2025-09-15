"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuthSimple } from '@/hooks/use-admin-auth-simple'

// =====================================================
// 🎯 CONTEXTO DE AUTENTICACIÓN SIMPLIFICADO - ELEVEN RIFAS
// =====================================================
// Contexto que proporciona autenticación optimizada
// Evita verificaciones constantes y usa cache eficiente
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

export function AdminAuthProviderSimple({ children }: AdminAuthProviderProps) {
  const authData = useAdminAuthSimple()

  return (
    <AdminAuthContext.Provider value={authData}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuthContextSimple() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuthContextSimple debe ser usado dentro de AdminAuthProviderSimple')
  }
  return context
}

// Hook de conveniencia para componentes que solo necesitan verificar estado
export function useAdminAuthState() {
  const { user, profile, isAdmin, isAuthenticated, isLoading } = useAdminAuthContextSimple()
  return { user, profile, isAdmin, isAuthenticated, isLoading }
}

// Hook de conveniencia para funciones de autenticación
export function useAdminAuthActions() {
  const { signIn, signOut, invalidateCache, refreshAuth } = useAdminAuthContextSimple()
  return { signIn, signOut, invalidateCache, refreshAuth }
}
