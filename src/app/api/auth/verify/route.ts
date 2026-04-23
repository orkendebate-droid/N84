import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { telegram_id } = await request.json()

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: true, profile })
  } catch (error: any) {
    return NextResponse.json({ exists: false, error: error.message })
  }
}
