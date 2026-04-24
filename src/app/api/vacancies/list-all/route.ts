import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')
    const industry = searchParams.get('industry')
    const employment_type = searchParams.get('employment_type')

    let query = supabaseAdmin
      .from('vacancies')
      .select('*')
      .neq('is_active', false) // показываем всё кроме явно отключённых

    if (area) {
      query = query.ilike('area', `%${area}%`)
    }
    if (industry) {
      query = query.eq('industry', industry)
    }
    if (employment_type) {
      query = query.eq('employment_type', employment_type)
    }

    const { data: vacancies, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, vacancies })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
