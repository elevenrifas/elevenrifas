import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/database'

export async function GET() {
  try {
    const { data, error } = await adminSupabase.rpc('get_rifas_full')
    if (error) throw error

    const top = (data || [])
      .filter((r: any) => (r.total_tickets || 0) > 0)
      .map((r: any) => ({
        id: r.rifa_id,
        titulo: r.titulo,
        vendidos: r.vendidos || 0,
        disponibles: r.disponibles || 0,
        total: r.total_tickets || 0,
        progreso: r.progreso || 0,
      }))
      .sort((a: any, b: any) => b.vendidos - a.vendidos)
      .slice(0, 10)

    return NextResponse.json({ success: true, data: top })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}





