import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { title, description, salary, area, requirements, employer_id } = await request.json()

    // 1. Создаем вакансию в БД
    const { data: vacancy, error } = await supabaseAdmin
      .from('vacancies')
      .insert({
        title,
        description,
        salary,
        area,
        requirements,
        employer_id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 2. Имитация AI-матчинга и Рассылка уведомлений молодежи
    // В реальности здесь вызывается Qwen для фильтрации, но сейчас отправим всем 'youth'
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('role', 'youth')
      .not('telegram_id', 'is', null)

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (users && botToken) {
      for (const user of users) {
        try {
          const message = `✨ *НОВАЯ ВАКАНСИЯ В ${area?.toUpperCase()}!*\n\n💼 *${title}*\n💰 Зарплата: ${salary}\n\n📍 Район: ${area}\n\nНажми кнопку ниже, чтобы узнать подробности и откликнуться! 👇`
          
          const keyboard = {
            inline_keyboard: [[
              { 
                text: 'Посмотреть детали 🔍', 
                web_app: { url: `https://n84-platform.vercel.app/vacancy/${vacancy.id}` } 
              }
            ]]
          }

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard
            })
          })
        } catch (botErr) {
          console.error(`Failed to send to user ${user.telegram_id}`, botErr)
        }
      }
    }

    return NextResponse.json({ success: true, vacancy })
  } catch (err: any) {
    console.error('Vacancy Creation Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
