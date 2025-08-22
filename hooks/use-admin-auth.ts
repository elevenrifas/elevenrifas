"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/database'
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
          }
          return
        }

        if (!session?.user) {
          console.log('❌ No hay sesión activa')
          if (mounted) {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
            setLoading(false)
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
  }, [])

  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      router.push('/admin/login')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    isAdmin,
    signOut
  }
}
