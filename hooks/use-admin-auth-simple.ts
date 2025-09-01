"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/supabase'
import { ADMIN_ROUTES } from '@/lib/routes'
import type { User } from '@supabase/supabase-js'

// =====================================================
// 🎯 HOOK DE AUTENTICACIÓN SIMPLIFICADO - ELEVEN RIFAS
// =====================================================
// Hook optimizado que verifica autenticación UNA SOLA VEZ
// Usa cache local y evita verificaciones constantes
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
  lastChecked: number
}

// Cache global para evitar verificaciones repetidas
let globalAuthCache: AuthState | null = null
let isCheckingGlobal = false

export function useAdminAuthSimple() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: true,
    lastChecked: 0
  })
  
  const router = useRouter()
  const hasInitialized = useRef(false)

  // Función para verificar autenticación (solo se ejecuta una vez)
  const checkAuth = useCallback(async (forceCheck = false) => {
    // Si ya se verificó recientemente y no es forzado, usar cache
    const now = Date.now()
    const cacheAge = now - (globalAuthCache?.lastChecked || 0)
    const cacheValid = cacheAge < 5 * 60 * 1000 // 5 minutos

    if (!forceCheck && globalAuthCache && cacheValid) {
      console.log('✅ useAdminAuth: Usando cache válido')
      setAuthState(globalAuthCache)
      return
    }

    // Evitar verificaciones simultáneas
    if (isCheckingGlobal && !forceCheck) {
      console.log('⏳ useAdminAuth: Verificación ya en progreso')
      return
    }

    isCheckingGlobal = true
    console.log('🔍 useAdminAuth: Verificando autenticación...')

    try {
      // Verificar sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ useAdminAuth: Error obteniendo sesión:', sessionError)
        const newState = {
          user: null,
          profile: null,
          isAdmin: false,
          isAuthenticated: false,
          isLoading: false,
          lastChecked: now
        }
        setAuthState(newState)
        globalAuthCache = newState
        return
      }

      if (!session?.user) {
        console.log('❌ useAdminAuth: No hay sesión activa')
        const newState = {
          user: null,
          profile: null,
          isAdmin: false,
          isAuthenticated: false,
          isLoading: false,
          lastChecked: now
        }
        setAuthState(newState)
        globalAuthCache = newState
        return
      }

      console.log('✅ useAdminAuth: Usuario encontrado:', session.user.email)

      // Verificar rol de admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .single()

      if (profileError || !profile) {
        console.log('❌ useAdminAuth: Usuario no es admin')
        const newState = {
          user: null,
          profile: null,
          isAdmin: false,
          isAuthenticated: false,
          isLoading: false,
          lastChecked: now
        }
        setAuthState(newState)
        globalAuthCache = newState
        return
      }

      console.log('✅ useAdminAuth: Usuario confirmado como admin')
      
      const newState = {
        user: session.user,
        profile,
        isAdmin: true,
        isAuthenticated: true,
        isLoading: false,
        lastChecked: now
      }
      
      setAuthState(newState)
      globalAuthCache = newState
      
    } catch (error) {
      console.error('❌ useAdminAuth: Error inesperado:', error)
      const newState = {
        user: null,
        profile: null,
        isAdmin: false,
        isAuthenticated: false,
        isLoading: false,
        lastChecked: now
      }
      setAuthState(newState)
      globalAuthCache = newState
    } finally {
      isCheckingGlobal = false
    }
  }, [])

  // Función para limpiar sesión
  const clearAuth = useCallback(async () => {
    console.log('🚪 useAdminAuth: Limpiando sesión...')
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('❌ useAdminAuth: Error al cerrar sesión:', error)
    }
    
    const newState = {
      user: null,
      profile: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: false,
      lastChecked: Date.now()
    }
    
    setAuthState(newState)
    globalAuthCache = newState
    router.push(ADMIN_ROUTES.LOGIN)
  }, [router])

  // Función para invalidar cache
  const invalidateCache = useCallback(() => {
    console.log('🗑️ useAdminAuth: Cache invalidado')
    globalAuthCache = null
    setAuthState(prev => ({ ...prev, lastChecked: 0 }))
  }, [])

  // Función para hacer login
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔑 useAdminAuth: Iniciando sesión...')
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ useAdminAuth: Error de login:', error.message)
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      if (!data.user) {
        console.error('❌ useAdminAuth: No se pudo obtener usuario del login')
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: 'Error de autenticación' }
      }

      console.log('✅ useAdminAuth: Login exitoso:', data.user.email)
      
      // Verificar sesión completa
      await checkAuth(true)
      
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ useAdminAuth: Error inesperado en login:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      }
    }
  }, [checkAuth])

  // Inicialización única
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      checkAuth()
    }
  }, [checkAuth])

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAdminAuth: Evento de autenticación:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ useAdminAuth: Usuario inició sesión')
          await checkAuth(true)
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ useAdminAuth: Usuario cerró sesión')
          clearAuth()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 useAdminAuth: Token refrescado')
          // Solo actualizar usuario, no verificar rol completo
          setAuthState(prev => ({ 
            ...prev, 
            user: session.user,
            lastChecked: Date.now()
          }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAuth, clearAuth])

  return {
    // Estado
    ...authState,
    
    // Funciones
    signIn,
    signOut: clearAuth,
    invalidateCache,
    refreshAuth: () => checkAuth(true)
  }
}
