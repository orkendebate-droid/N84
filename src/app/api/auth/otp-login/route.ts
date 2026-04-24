import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, code, role } = await request.json()

    if (!username || !code) {
      return NextResponse.json({ success: false, error: 'Введите ник и код' }, { status: 400 })
    }

    const cleanUsername = username.toLowerCase().replace('@', '')

    // 1. Ищем сначала по username (регистронезависимо)
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .eq('otp_code', code)
      .single()

    // 2. Если не нашли по username — пробуем по telegram_id (для юзеров без ника)
    if (error || !profile) {
      const possibleId = Number(cleanUsername)
      if (!isNaN(possibleId) && possibleId > 0) {
        const { data: profileById } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('telegram_id', possibleId)
          .eq('otp_code', code)
          .single()
        profile = profileById
      }
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Неверный ник или код. Напишите /login в боте!' }, { status: 401 })
    }

    // 3. Сбрасываем код после успешного входа
    await supabaseAdmin
      .from('profiles')
      .update({ otp_code: null })
      .eq('id', profile.id)

    // 4. Если заходит как работодатель впервые — меняем роль
    if (role === 'employer' && profile.role !== 'employer') {
      await supabaseAdmin.from('profiles').update({ role: 'employer' }).eq('id', profile.id)
      profile.role = 'employer'
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
