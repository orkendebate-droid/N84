import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id, full_name, address, bio, company_name, bin_iin, industry, link } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        address,
        bio,
        company_name,
        bin_iin,
        industry,
        link,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
