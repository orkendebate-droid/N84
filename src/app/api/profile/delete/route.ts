import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
