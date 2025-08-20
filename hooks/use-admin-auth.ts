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
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Verificar si es admin
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, email, role, created_at')
            .eq('id', session.user.id)
            .eq('role', 'admin')
            .single()

          if (error || !profileData) {
            // No es admin, redirigir a login
            await supabase.auth.signOut()
            router.push('/admin/login')
            return
          }

          setProfile(profileData)
          setIsAdmin(true)
        } else {
          // No hay sesión, redirigir a login
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          
          // Verificar si es admin
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, email, role, created_at')
            .eq('id', session.user.id)
            .eq('role', 'admin')
            .single()

          if (error || !profileData) {
            await supabase.auth.signOut()
            router.push('/admin/login')
            return
          }

          setProfile(profileData)
          setIsAdmin(true)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setIsAdmin(false)
          router.push('/admin/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
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
