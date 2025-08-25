"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database/supabase'
import type { User } from '@supabase/supabase-js'

interface AdminProfile {
  id: string
  email: string
  role: string
  created_at: string
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Función para verificar sesión
    const checkSession = async () => {
      try {
        console.log('🔍 Verificando sesión...')
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Error obteniendo sesión:', sessionError)
          if (mounted) {
            setLoading(false)
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
          }
          return
        }

        if (!session?.user) {
          console.log('❌ No hay sesión activa - redirigiendo a login')
          if (mounted) {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
            setLoading(false)
            // Redirigir al login si no hay sesión
            router.push('/admin/login')
          }
          return
        }

        console.log('✅ Usuario encontrado:', session.user.email)
        if (mounted) {
          setUser(session.user)
        }

        // Verificar rol de admin
        console.log('🔍 Verificando rol de admin...')
        console.log('🔍 Buscando perfil para usuario ID:', session.user.id)
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .eq('id', session.user.id)
          .eq('role', 'admin')
          .single()

        console.log('🔍 Resultado de búsqueda de perfil:')
        console.log('🔍 - Profile data:', profileData)
        console.log('🔍 - Profile error:', profileError)
        
        if (profileError || !profileData) {
          console.log('❌ Usuario no es admin:', profileError?.message)
          
          // Vamos a verificar si el usuario existe en profiles pero con otro rol
          console.log('🔍 Verificando si el usuario existe en profiles...')
          const { data: anyProfile, error: anyProfileError } = await supabase
            .from('profiles')
            .select('id, email, role, created_at')
            .eq('id', session.user.id)
            .single()
          
          console.log('🔍 Perfil encontrado (cualquier rol):', anyProfile)
          console.log('🔍 Error de perfil (cualquier rol):', anyProfileError)
          
          if (mounted) {
            setProfile(null)
            setIsAdmin(false)
            setLoading(false)
            // Redirigir al login si no es admin
            router.push('/admin/login')
          }
          return
        }

        console.log('✅ Usuario confirmado como admin')
        if (mounted) {
          setProfile(profileData)
          setIsAdmin(true)
          setLoading(false)
        }

      } catch (error) {
        console.error('❌ Error inesperado:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setIsAdmin(false)
          setLoading(false)
          // Redirigir al login en caso de error
          router.push('/admin/login')
        }
      }
    }

    // Verificar sesión inicial
    checkSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de autenticación:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Usuario inició sesión, verificando...')
          if (mounted) {
            setUser(session.user)
            setLoading(true)
          }
          // Verificar rol de admin
          await checkSession()
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ Usuario cerró sesión')
          if (mounted) {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
            setLoading(false)
            router.push('/admin/login')
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refrescado, verificando sesión...')
          if (mounted) {
            setUser(session.user)
            setLoading(true)
          }
          await checkSession()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      setLoading(false)
      router.push('/admin/login')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Iniciando sesión...')
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Error de login:', error.message)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        console.error('❌ No se pudo obtener usuario del login')
        setLoading(false)
        return { success: false, error: 'Error de autenticación' }
      }

      console.log('✅ Login exitoso:', data.user.email)
      
      // El hook se encargará de verificar el rol de admin
      // No necesitamos hacer nada más aquí
      
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ Error inesperado en login:', error)
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
  }
}
