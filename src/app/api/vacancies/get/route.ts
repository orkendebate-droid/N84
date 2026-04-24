import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) throw new Error('ID missing')

    const { data: vacancy, error } = await supabaseAdmin
      .from('vacancies')
      .select('*, employer:employer_id(full_name)')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, vacancy })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
