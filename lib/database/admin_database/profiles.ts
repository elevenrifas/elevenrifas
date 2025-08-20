import { supabase } from "@/lib/database"
import type { Database } from "@/types/supabase"

type Profile = Database['public']['Tables']['profiles']['Row']

export async function adminListProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in adminListProfiles:', error)
    throw error
  }
}

export async function adminCreateProfile(profileData: Database['public']['Tables']['profiles']['Insert']): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminCreateProfile:', error)
    throw error
  }
}

export async function adminUpdateProfile(id: string, profileData: Database['public']['Tables']['profiles']['Update']): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminUpdateProfile:', error)
    throw error
  }
}

export async function adminDeleteProfile(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting profile:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in adminDeleteProfile:', error)
    throw error
  }
}

export async function adminGetProfile(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminGetProfile:', error)
    throw error
  }
}
