import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, code, role } = await request.json()

    if (!username || !code) {
      return NextResponse.json({ success: false, error: 'Введите ник и код' }, { status: 400 })
    }

    // 1. Ищем профиль по username и проверяем otp_code
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase().replace('@', ''))
      .eq('otp_code', code)
      .single()

    if (error || !profile) {
      return NextResponse.json({ success: false, error: 'Неверный ник или код. Напишите /login в боте!' }, { status: 401 })
    }

    // 2. Сбрасываем код после успешного входа
    await supabaseAdmin
      .from('profiles')
      .update({ otp_code: null })
      .eq('id', profile.id)

    // 3. Если заходит как работодатель впервые - меняем роль (если базы это позволяют)
    if (role === 'employer' && profile.role !== 'employer') {
        await supabaseAdmin.from('profiles').update({ role: 'employer' }).eq('id', profile.id)
        profile.role = 'employer'
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
