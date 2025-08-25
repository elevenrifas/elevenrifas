"use client"

import { useContext } from 'react'
import { useAdminAuthContext } from '@/lib/context/AdminAuthContext'

/**
 * Hook simplificado para componentes que solo necesiten verificar
 * el estado de autenticación sin hacer verificaciones completas
 * 
 * Este hook es más eficiente que useAdminAuth para componentes
 * que solo necesitan leer el estado actual
 */
export function useAdminAuthSimple() {
  const { user, profile, loading, isAdmin } = useAdminAuthContext()
  
  return {
    user,
    profile,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    isAdminUser: !!isAdmin,
    isLoading: loading,
  }
}
