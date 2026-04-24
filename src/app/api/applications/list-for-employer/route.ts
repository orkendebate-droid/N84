import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employer_id = searchParams.get('employer_id')

    if (!employer_id) return NextResponse.json({ success: false, error: 'Employer ID required' }, { status: 400 })

    const { data: vacancies } = await supabaseAdmin
      .from('vacancies')
      .select('id, title')
      .eq('employer_id', employer_id)

    if (!vacancies || vacancies.length === 0) {
      return NextResponse.json({ success: true, applications: [] })
    }

    const vacancyIds = vacancies.map(v => v.id)

    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        status,
        match_score,
        created_at,
        vacancy:vacancy_id(title),
        youth:youth_id(full_name, bio, address, telegram_id, username)
      `)
      .in('vacancy_id', vacancyIds)
      .order('created_at', { ascending: false })

    if (appError) throw appError

    return NextResponse.json({ success: true, applications })
  } catch (err: any) {
    console.error('List Apps Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
