"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/supabase'
import { getAdminPerformanceConfig } from '@/lib/config/admin-performance'
import type { User } from '@supabase/supabase-js'

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

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  
  // Obtener configuración de rendimiento
  const config = getAdminPerformanceConfig()
  
  // Cache de sesión para evitar verificaciones repetidas
  const sessionCache = useRef<SessionCache | null>(null)
  const isVerifying = useRef(false)
  const lastCheckTime = useRef(0)
  
  // Función optimizada para verificar sesión
  const checkSession = useCallback(async (forceCheck = false) => {
    const now = Date.now()
    
    // Evitar verificaciones simultáneas
    if (isVerifying.current && !forceCheck) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.log('⏳ Verificación ya en progreso, esperando...')
      return
    }
    
    // Verificar intervalo mínimo entre verificaciones
    if (!forceCheck && now - lastCheckTime.current < config.MIN_SESSION_CHECK_INTERVAL) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.log('⏳ Muy pronto para verificar, esperando...')
      return
    }
    
    // Verificar cache si no es forzado
    if (!forceCheck && sessionCache.current && now - sessionCache.current.timestamp < config.SESSION_CACHE_DURATION) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.log('✅ Usando cache de sesión válido')
      setUser(sessionCache.current.user)
      setProfile(sessionCache.current.profile)
      setIsAdmin(sessionCache.current.isAdmin)
      setLoading(false)
      return
    }
    
    isVerifying.current = true
    lastCheckTime.current = now
    if (config.ENABLE_PERFORMANCE_LOGS) console.log('🔍 Verificando sesión...')
    
    const startTime = performance.now()
    
    try {
      // Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ Error obteniendo sesión:', sessionError)
        clearSession()
        return
      }

      if (!session?.user) {
        if (config.ENABLE_PERFORMANCE_LOGS) console.log('❌ No hay sesión activa')
        clearSession()
        return
      }

      if (config.ENABLE_PERFORMANCE_LOGS) console.log('✅ Usuario encontrado:', session.user.email)
      setUser(session.user)

      // Verificar rol de admin en una sola consulta optimizada
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .single()

      if (profileError || !profileData) {
        if (config.ENABLE_PERFORMANCE_LOGS) console.log('❌ Usuario no es admin')
        clearSession()
        return
      }

      if (config.ENABLE_PERFORMANCE_LOGS) console.log('✅ Usuario confirmado como admin')
      
      // Actualizar estado
      setProfile(profileData)
      setIsAdmin(true)
      setLoading(false)
      
      // Guardar en cache
      sessionCache.current = {
        timestamp: now,
        user: session.user,
        profile: profileData,
        isAdmin: true
      }
      
      // Log de rendimiento
      const duration = performance.now() - startTime
      if (config.ENABLE_PERFORMANCE_LOGS) {
        console.log(`⚡ Verificación completada en ${duration.toFixed(2)}ms`)
      }
      
    } catch (error) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ Error inesperado:', error)
      clearSession()
    } finally {
      isVerifying.current = false
    }
  }, [config])
  
  // Función para limpiar sesión
  const clearSession = useCallback(() => {
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
    setLoading(false)
    sessionCache.current = null
    lastCheckTime.current = 0
    router.push('/admin/login')
  }, [router])
  
  // Función para invalidar cache
  const invalidateCache = useCallback(() => {
    sessionCache.current = null
    lastCheckTime.current = 0
    if (config.ENABLE_PERFORMANCE_LOGS) console.log('🗑️ Cache invalidado')
  }, [config])

  useEffect(() => {
    let mounted = true

    // Verificar sesión inicial solo una vez
    if (mounted) {
      checkSession()
    }

    // Escuchar cambios en la autenticación de forma optimizada
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (config.ENABLE_PERFORMANCE_LOGS) console.log('🔄 Evento de autenticación:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          if (config.ENABLE_PERFORMANCE_LOGS) console.log('✅ Usuario inició sesión')
          // Verificar sesión completa solo si es necesario
          if (!sessionCache.current || Date.now() - sessionCache.current.timestamp > config.SESSION_CACHE_DURATION) {
            await checkSession(true)
          }
        } else if (event === 'SIGNED_OUT') {
          if (config.ENABLE_PERFORMANCE_LOGS) console.log('❌ Usuario cerró sesión')
          clearSession()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (config.ENABLE_PERFORMANCE_LOGS) console.log('🔄 Token refrescado')
          // Solo actualizar usuario si el token cambió, no verificar rol completo
          if (mounted) {
            setUser(session.user)
            // Invalidar cache para forzar verificación en próxima operación
            invalidateCache()
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkSession, clearSession, invalidateCache, config])

  const signOut = async () => {
    try {
      if (config.ENABLE_PERFORMANCE_LOGS) console.log('🚪 Cerrando sesión...')
      await supabase.auth.signOut()
      clearSession()
    } catch (error) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ Error al cerrar sesión:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (config.ENABLE_PERFORMANCE_LOGS) console.log('🔑 Iniciando sesión...')
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ Error de login:', error.message)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ No se pudo obtener usuario del login')
        setLoading(false)
        return { success: false, error: 'Error de autenticación' }
      }

      if (config.ENABLE_PERFORMANCE_LOGS) console.log('✅ Login exitoso:', data.user.email)
      
      // El hook se encargará de verificar el rol de admin automáticamente
      return { success: true, user: data.user }

    } catch (error) {
      if (config.ENABLE_PERFORMANCE_LOGS) console.error('❌ Error inesperado en login:', error)
      setLoading(false)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      }
    }
  }

  return {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signOut,
    invalidateCache, // Exponer para uso externo si es necesario
  }
}
