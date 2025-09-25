"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/supabase'
import type { User } from '@supabase/supabase-js'

// =====================================================
// ⚡ AUTENTICACIÓN SÚPER SIMPLE - SOLO STORAGE
// =====================================================
// Sin cache, sin procesos complejos, solo verificación instantánea
// =====================================================

interface AdminProfile {
  id: string
  email: string
  role: string
  created_at: string
}

interface AuthState {
  user: User | null
  profile: AdminProfile | null
  isAdmin: boolean
  isAuthenticated: boolean
  isLoading: boolean
}

const STORAGE_KEY = 'admin_auth_state'
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas

export function useAdminAuthSimpleStorage() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Inicialización sin flicker: intentar cargar del storage de forma síncrona
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const authData = JSON.parse(stored)
        const now = Date.now()
        if (now - authData.timestamp <= STORAGE_EXPIRY) {
          return {
            user: authData.user,
            profile: authData.profile,
            isAdmin: true,
            isAuthenticated: true,
            isLoading: false
          }
        }
      }
    } catch {
      // Ignorar errores y continuar con estado por defecto
    }
    return {
      user: null,
      profile: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: true
    }
  })
  
  const router = useRouter()

  // Función para guardar en storage
  const saveToStorage = useCallback((user: User, profile: AdminProfile) => {
    const authData = {
      user,
      profile,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
  }, [])

  // Función para leer del storage
  const getFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const authData = JSON.parse(stored)
      const now = Date.now()
      
      // Verificar si no ha expirado
      if (now - authData.timestamp > STORAGE_EXPIRY) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return authData
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }, [])

  // Función para limpiar storage
  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Verificación súper simple - solo storage
  const checkAuth = useCallback(async () => {
    console.log('⚡ Verificación instantánea desde storage...')
    
    // 1. Verificar storage primero (instantáneo)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const authData = JSON.parse(stored)
        const now = Date.now()
        
        // Verificar si no ha expirado
        if (now - authData.timestamp <= STORAGE_EXPIRY) {
          console.log('✅ Usuario encontrado en storage:', authData.user.email)
          setAuthState({
            user: authData.user,
            profile: authData.profile,
            isAdmin: true,
            isAuthenticated: true,
            isLoading: false
          })
          return
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }

    // 2. Si no hay storage, verificar sesión de Supabase (solo una vez)
    console.log('🔍 Verificando sesión de Supabase...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      console.log('❌ No hay sesión activa')
      setAuthState({
        user: null,
        profile: null,
        isAdmin: false,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    // 3. Verificar si es admin (solo si no está en storage)
    console.log('🔍 Verificando rol admin...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', session.user.id)
      .eq('role', 'admin')
      .single()

    if (profileError || !profile) {
      console.log('❌ Usuario no es admin')
      setAuthState({
        user: null,
        profile: null,
        isAdmin: false,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    // 4. Guardar en storage para próximas verificaciones
    console.log('✅ Usuario admin confirmado, guardando en storage')
    const authData = {
      user: session.user,
      profile,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
    
    setAuthState({
      user: session.user,
      profile,
      isAdmin: true,
      isAuthenticated: true,
      isLoading: false
    })
  }, []) // ← SIN DEPENDENCIAS = NO SE RECREA

  // Función para cerrar sesión
  const signOut = useCallback(async () => {
    console.log('🚪 Cerrando sesión...')
    await supabase.auth.signOut()
    clearStorage()
    setAuthState({
      user: null,
      profile: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: false
    })
    router.push('/admin/login')
  }, [clearStorage, router])

  // Función para iniciar sesión
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔑 Iniciando sesión...')
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Error de login:', error.message)
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      if (!data.user) {
        console.error('❌ No se pudo obtener usuario del login')
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: 'Error de autenticación' }
      }

      console.log('✅ Login exitoso:', data.user.email)
      
      // Verificar rol admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', data.user.id)
        .eq('role', 'admin')
        .single()

      if (profileError || !profile) {
        console.log('❌ Usuario no es admin')
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: 'No tienes permisos de administrador' }
      }

      // Guardar en storage
      saveToStorage(data.user, profile)
      
      setAuthState({
        user: data.user,
        profile,
        isAdmin: true,
        isAuthenticated: true,
        isLoading: false
      })
      
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ Error inesperado en login:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      }
    }
  }, [saveToStorage])

  // Inicialización - solo verificar storage
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de autenticación:', event)
        
        if (event === 'SIGNED_OUT') {
          console.log('❌ Usuario cerró sesión')
          clearStorage()
          setAuthState({
            user: null,
            profile: null,
            isAdmin: false,
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [clearStorage])

  return {
    // Estado
    ...authState,
    
    // Funciones
    signIn,
    signOut,
    refreshAuth: checkAuth
  }
}
