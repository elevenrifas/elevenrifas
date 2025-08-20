import { supabase } from "@/lib/database"
import type { Database } from "@/types/supabase"

type CategoriaRifa = Database['public']['Tables']['categorias_rifas']['Row']

export async function adminListCategorias(): Promise<CategoriaRifa[]> {
  try {
    const { data, error } = await supabase
      .from('categorias_rifas')
      .select('*')
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error fetching categorias:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in adminListCategorias:', error)
    throw error
  }
}

export async function adminCreateCategoria(categoriaData: Database['public']['Tables']['categorias_rifas']['Insert']): Promise<CategoriaRifa> {
  try {
    const { data, error } = await supabase
      .from('categorias_rifas')
      .insert(categoriaData)
      .select()
      .single()

    if (error) {
      console.error('Error creating categoria:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminCreateCategoria:', error)
    throw error
  }
}

export async function adminUpdateCategoria(id: string, categoriaData: Database['public']['Tables']['categorias_rifas']['Update']): Promise<CategoriaRifa> {
  try {
    const { data, error } = await supabase
      .from('categorias_rifas')
      .update(categoriaData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating categoria:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminUpdateCategoria:', error)
    throw error
  }
}

export async function adminDeleteCategoria(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categorias_rifas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting categoria:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in adminDeleteCategoria:', error)
    throw error
  }
}

export async function adminGetCategoria(id: string): Promise<CategoriaRifa | null> {
  try {
    const { data, error } = await supabase
      .from('categorias_rifas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching categoria:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminGetCategoria:', error)
    throw error
  }
}
