import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) throw new Error('Missing params')

    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, application })
  } catch (err: any) {
    console.error('Update App Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
