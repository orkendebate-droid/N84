import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json({ success: false, error: 'Missing vacancy ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('vacancies')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Vacancy delete error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
