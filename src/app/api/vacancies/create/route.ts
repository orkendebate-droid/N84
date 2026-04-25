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
        industry
      })
      .select()
      .single()

    if (error) throw error
    if (!vacancy) throw new Error('Failed to create vacancy record')

    // 2. ИИ-матчинг: выбираем только подходящих ребят
    console.log(`[POST-JOB] Matching candidates for vacancy: ${vacancy.id}`);
    const matchedUsers = await matchCandidates(vacancy)
    console.log(`[POST-JOB] AI matched ${matchedUsers?.length || 0} candidates`);

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (botToken && matchedUsers && matchedUsers.length > 0) {
        console.log(`[PITCH] Sending REAL dynamic notifications to ${matchedUsers.length} users...`);
        const TYPE_LABELS: any = { full_time: 'Полная занятость', part_time: 'Частичная', gig: 'Подработка' }
        const empTypeStr = TYPE_LABELS[employment_type] || employment_type

        for (const candidate of matchedUsers) {
            // Если у кандидата нет привязанного ТГ - пропускаем
            if (!candidate.telegram_id) continue;

            try {
              const message = `🔥 *НОВАЯ РАБОТА ДЛЯ ТЕБЯ!*\n\n` +
                              `🎯 *Подходимость:* Высокая!\n` +
                              `💼 *Професия:* ${title}\n` +
                              `⏳ *Занятость:* ${empTypeStr}\n` +
                              `💰 *Зарплата:* ${salary}\n` +
                              `📍 *Адрес:* ${area}\n\n` +
                              `_Наш ИИ проанализировал твой профиль и считает, что эта вакансия тебе подходит!_`
              
              const detailUrl = `https://n84-platform.vercel.app/vacancy/${vacancy.id}`

              // Ограничение Telegram: callback_data строго <= 64 байт!
              const callback_data = `apply_${vacancy.id}`

              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: candidate.telegram_id,
                  text: message,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '📂 Подробнее', url: detailUrl }],
                      [{ text: '✅ Откликнуться', callback_data }]
                    ]
                  }
                })
              })
            } catch (err) {
               console.error(`Failed to notify candidate ${candidate.id}`, err);
            }
        }
    }

    return NextResponse.json({ success: true, vacancy })
  } catch (err: any) {
    console.error('Vacancy Creation Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
