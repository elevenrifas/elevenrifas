import { supabase } from "@/lib/database"
import type { Database } from "@/types/supabase"

type Ticket = Database['public']['Tables']['tickets']['Row']

export async function adminListTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        rifas (
          id,
          titulo,
          precio_ticket
        )
      `)
      .order('fecha_compra', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in adminListTickets:', error)
    throw error
  }
}

export async function adminCreateTicket(ticketData: Database['public']['Tables']['tickets']['Insert']): Promise<Ticket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminCreateTicket:', error)
    throw error
  }
}

export async function adminUpdateTicket(id: string, ticketData: Database['public']['Tables']['tickets']['Update']): Promise<Ticket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update(ticketData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminUpdateTicket:', error)
    throw error
  }
}

export async function adminDeleteTicket(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting ticket:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in adminDeleteTicket:', error)
    throw error
  }
}

export async function adminGetTicket(id: string): Promise<Ticket | null> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        rifas (
          id,
          titulo,
          precio_ticket
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in adminGetTicket:', error)
    throw error
  }
}
