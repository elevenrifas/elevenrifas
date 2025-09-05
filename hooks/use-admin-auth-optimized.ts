"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/supabase'
import { getAdminPerformanceConfig } from '@/lib/config/admin-performance'
import type { User } from '@supabase/supabase-js'

// =====================================================
// 🚀 HOOK DE AUTENTICACIÓN ADMIN OPTIMIZADO - ELEVEN RIFAS
// =====================================================
// Hook unificado que elimina verificaciones redundantes
// Usa cache inteligente y consultas optimizadas
// =====================================================

interface AdminProfile {
  id: string
  email: string
  role: string
  created_at: string
}

interface SessionCache {
  timestamp: number
  user: User
  profile: AdminProfile
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  profile: AdminProfile | null
  isAdmin: boolean
  isAuthenticated: boolean
  isLoading: boolean
  lastChecked: number
}

// Cache global compartido para evitar verificaciones múltiples
let globalAuthCache: SessionCache | null = null
let isVerifyingGlobal = false
let lastGlobalCheck = 0

export function useAdminAuthOptimized() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: true,
    lastChecked: 0
  })
  
  const router = useRouter()
  const config = getAdminPerformanceConfig()
  const hasInitialized = useRef(false)

  // Función optimizada para verificar autenticación
  const checkAuth = useCallback(async (forceCheck = false) => {
    const now = Date.now()
    
    // Evitar verificaciones simultáneas
    if (isVerifyingGlobal && !forceCheck) {
      console.log('⏳ useAdminAuthOptimized: Verificación ya en progreso')
      return
    }

    // Verificar cache si no es forzado
    if (!forceCheck && globalAuthCache && now - globalAuthCache.timestamp < config.SESSION_CACHE_DURATION) {
      console.log('✅ useAdminAuthOptimized: Usando cache válido')
      setAuthState({
        user: globalAuthCache.user,
        profile: globalAuthCache.profile,
        isAdmin: globalAuthCache.isAdmin,
        isAuthenticated: true,
        isLoading: false,
        lastChecked: globalAuthCache.timestamp
      })
      return
    }

    // Verificar intervalo mínimo
    if (!forceCheck && now - lastGlobalCheck < config.MIN_SESSION_CHECK_INTERVAL) {
      console.log('⏳ useAdminAuthOptimized: Muy pronto para verificar')
      return
    }

    isVerifyingGlobal = true
    lastGlobalCheck = now
    console.log('🔍 useAdminAuthOptimized: Verificando autenticación...')

    const startTime = performance.now()

    try {
      // 1. Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ useAdminAuthOptimized: Error obteniendo sesión:', sessionError)
        clearAuthState()
        return
      }

      if (!session?.user) {
        console.log('❌ useAdminAuthOptimized: No hay sesión activa')
        clearAuthState()
        return
      }

      console.log('✅ useAdminAuthOptimized: Usuario encontrado:', session.user.email)

      // 2. Verificar rol de admin con consulta optimizada
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .single()

      if (profileError || !profile) {
        console.log('❌ useAdminAuthOptimized: Usuario no es admin')
        clearAuthState()
        return
      }

      console.log('✅ useAdminAuthOptimized: Usuario confirmado como admin')
      
      // 3. Actualizar estado y cache
      const newState = {
        user: session.user,
        profile,
        isAdmin: true,
        isAuthenticated: true,
        isLoading: false,
        lastChecked: now
      }
      
      setAuthState(newState)
      
      // Actualizar cache global
      globalAuthCache = {
        timestamp: now,
        user: session.user,
        profile,
        isAdmin: true
      }

      // Log de rendimiento
      const duration = performance.now() - startTime
      if (config.ENABLE_PERFORMANCE_LOGS) {
        console.log(`⚡ useAdminAuthOptimized: Verificación completada en ${duration.toFixed(2)}ms`)
      }
      
    } catch (error) {
      console.error('❌ useAdminAuthOptimized: Error inesperado:', error)
      clearAuthState()
    } finally {
      isVerifyingGlobal = false
    }
  }, [config])

  // Función para limpiar estado de autenticación
  const clearAuthState = useCallback(() => {
    const newState = {
      user: null,
      profile: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: false,
      lastChecked: Date.now()
    }
    
    setAuthState(newState)
    globalAuthCache = null
  }, [])

  // Función para cerrar sesión
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 useAdminAuthOptimized: Cerrando sesión...')
      await supabase.auth.signOut()
      clearAuthState()
      router.push('/admin/login')
    } catch (error) {
      console.error('❌ useAdminAuthOptimized: Error al cerrar sesión:', error)
    }
  }, [clearAuthState, router])

  // Función para iniciar sesión
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔑 useAdminAuthOptimized: Iniciando sesión...')
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ useAdminAuthOptimized: Error de login:', error.message)
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      if (!data.user) {
        console.error('❌ useAdminAuthOptimized: No se pudo obtener usuario del login')
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: 'Error de autenticación' }
      }

      console.log('✅ useAdminAuthOptimized: Login exitoso:', data.user.email)
      
      // Verificar sesión completa
      await checkAuth(true)
      
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ useAdminAuthOptimized: Error inesperado en login:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      }
    }
  }, [checkAuth])

  // Función para invalidar cache
  const invalidateCache = useCallback(() => {
    console.log('🗑️ useAdminAuthOptimized: Cache invalidado')
    globalAuthCache = null
    setAuthState(prev => ({ ...prev, lastChecked: 0 }))
  }, [])

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
        console.log('🔄 useAdminAuthOptimized: Evento de autenticación:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ useAdminAuthOptimized: Usuario inició sesión')
          await checkAuth(true)
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ useAdminAuthOptimized: Usuario cerró sesión')
          clearAuthState()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 useAdminAuthOptimized: Token refrescado')
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
  }, [checkAuth, clearAuthState])

  return {
    // Estado
    ...authState,
    
    // Funciones
    signIn,
    signOut,
    invalidateCache,
    refreshAuth: () => checkAuth(true)
  }
}
