import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const user = await request.json()

    // 1. Сохраняем или обновляем профиль в Supabase
    // Мы используем upsert, чтобы если пользователь зашел второй раз, данные просто обновились
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        telegram_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        updated_at: new Date().toISOString()
      }, { onConflict: 'telegram_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
