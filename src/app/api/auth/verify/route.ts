import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { telegram_id, id } = await request.json()

    let query = supabaseAdmin.from('profiles').select('*')
    
    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('telegram_id', telegram_id)
    }

    const { data: profile, error } = await query.single()

    if (error || !profile) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: true, profile })
  } catch (error: any) {
    return NextResponse.json({ exists: false, error: error.message })
  }
}
