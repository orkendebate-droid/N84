import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { role, ...user } = await request.json()
    
    // Проверка подписи Телеграма
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) throw new Error('BOT_TOKEN missing')

    const { hash, ...data } = user
    const checkString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n')

    const secretKey = crypto.createHash('sha256').update(botToken).digest()
    const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

    if (hmac !== hash) {
      return NextResponse.json({ success: false, error: 'Invalid hash' }, { status: 401 })
    }

    // Ищем или создаем пользователя
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        telegram_id: user.id,
        username: user.username?.toLowerCase() || null,
        full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
        first_name: user.first_name,
        role: role,
        is_verified: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'telegram_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    console.error('TG Login Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
