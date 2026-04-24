import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { matchCandidates } from '@/lib/matching'

export async function POST(request: Request) {
  try {
    const { title, description, salary, area, requirements, employer_id, employment_type, industry } = await request.json()

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
        employment_type,
        industry,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    if (!vacancy) throw new Error('Failed to create vacancy record')

    // 2. ИИ-матчинг: выбираем только подходящих ребят
    const matchedUsers = await matchCandidates(vacancy)

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (matchedUsers && matchedUsers.length > 0 && botToken) {
      for (const user of matchedUsers) {
        if (!user) continue;
        try {
          const message = `🔥 *НОВАЯ РАБОТА ДЛЯ ТЕБЯ!*\n\n` +
                          `🎯 *Подходимость:* ${user.match_score}/10\n` +
                          `💼 *Должность:* ${title}\n` +
                          `💰 *Зарплата:* ${salary}\n` +
                          `📍 *Район:* ${area}\n\n` +
                          `_Наш ИИ проанализировал твой профиль и считает, что эта вакансия тебе подходит!_`
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: '📂 Подробнее', web_app: { url: `https://n84-platform.vercel.app/vacancy/${vacancy.id}` } },
                { text: '✅ Откликнуться', web_app: { url: `https://n84-platform.vercel.app/vacancy/${vacancy.id}` } }
              ],
              [
                { text: '❌ Отклонить', callback_data: `reject_vacancy` }
              ],
              [
                { text: '👍 Классная подборка', callback_data: `feedback_up` },
                { text: '👎 Не совсем то', callback_data: `feedback_down` }
              ]
            ]
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
