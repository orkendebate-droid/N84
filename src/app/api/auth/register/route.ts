import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { fullName, telegram, role } = await request.json()
    const verifyCode = Math.floor(1000 + Math.random() * 9000).toString()

    const username = telegram.startsWith('@') ? telegram.substring(1) : telegram

    // Сохраняем в базу
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: fullName,
        username: username.toLowerCase(),
        role: role,
        verification_code: verifyCode,
        first_name: fullName.split(' ')[0],
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // Если такой username уже есть
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Пользователь с таким Telegram уже существует' }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
