import { NextResponse } from 'next/server'
import { adminGetDashboardStats } from '@/lib/database/admin_database/dashboard'

export async function GET() {
  try {
    const result = await adminGetDashboardStats()
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Error desconocido' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}





