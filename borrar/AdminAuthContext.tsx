"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'

interface AdminAuthContextType {
  user: any
  profile: any
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>
  signOut: () => Promise<void>
  invalidateCache: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const authData = useAdminAuth()

  return (
    <AdminAuthContext.Provider value={authData}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuthContext debe ser usado dentro de AdminAuthProvider')
  }
  return context
}
