import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employerId = searchParams.get('employer_id')

    if (!employerId) throw new Error('Employer ID missing')

    const { data: vacancies, error } = await supabaseAdmin
      .from('vacancies')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, vacancies })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
