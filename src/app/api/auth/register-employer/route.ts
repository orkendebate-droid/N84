import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, code, full_name, company_name, bin_iin, industry } = await request.json()

    if (!username || !code || !company_name || !bin_iin) {
      return NextResponse.json({ success: false, error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    // 1. Сначала проверяем код в базе (пользователь уже должен был нажать /start и /login)
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase().replace('@', ''))
      .eq('otp_code', code)
      .single()

    if (findError || !profile) {
      return NextResponse.json({ success: false, error: 'Неверный ник или код. Сначала нажмите /login в боте!' }, { status: 401 })
    }

    // 2. Обновляем профиль данными работодателя
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        company_name,
        bin_iin,
        industry,
        role: 'employer',
        is_verified: true,
        otp_code: null // Сбрасываем код
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
