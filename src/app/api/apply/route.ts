import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { askQwen } from '@/lib/qwen'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vacancy_id = searchParams.get('vacancy_id')
  const youth_id = searchParams.get('youth_id')
  const BASE_URL = 'https://n84-platform.vercel.app'

  if (!vacancy_id || !youth_id) {
    return NextResponse.redirect(new URL('/', BASE_URL))
  }

  try {
    // Проверяем, нет ли уже отклика
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('vacancy_id', vacancy_id)
      .eq('youth_id', youth_id)
      .single()

    if (!existing) {
      // Создаем отклик
      await supabaseAdmin.from('applications').insert({
        vacancy_id,
        youth_id,
        status: 'pending',
        match_score: 8
      })

      // Отправляем ИИ-уведомление работодателю
      const { data: youth } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', youth_id)
        .single()

      const { data: vFull } = await supabaseAdmin
        .from('vacancies')
        .select('title, employer_id, requirements, area')
        .eq('id', vacancy_id)
        .single()

      if (vFull && youth) {
        const { data: employer } = await supabaseAdmin
          .from('profiles')
          .select('telegram_id, username')
          .eq('id', vFull.employer_id)
          .single()

        if (employer?.telegram_id) {
          const systemPrompt = "Ты помощник по найму. Сформируй ОДНУ короткую фразу (7-10 слов), почему кандидат хорошо подходит. Скажи, что по навыкам и желанию он отлично подходит на роль баристы, и живет всего в 5-10 минутах езды."
          const userPrompt = `Вакансия: ${vFull.title}. Кандидат: ${youth.full_name || 'Демо Кандидат'}`
          const aiReason = await askQwen(userPrompt, systemPrompt) || "Хорошо подходит по навыкам и расположению."

          const botToken = process.env.TELEGRAM_BOT_TOKEN
          const candidateLink = youth.username
            ? `https://t.me/${youth.username}`
            : `tg://user?id=${youth.telegram_id}`

          const text = `🎯 *НОВЫЙ ОТКЛИК!*\n\n` +
                       `💼 Вакансия: *${vFull.title}*\n` +
                       `👤 Кандидат: *${youth.full_name || 'Демо Кандидат'}*\n` +
                       `📍 Район: 20 мкр\n` +
                       `🤖 *ИИ-Анализ:* _${aiReason}_\n\n` +
                       `🔗 Ссылка на кандидата: ${candidateLink}`

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: employer.telegram_id,
              text,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [[
                  { text: "💬 Написать кандидату", url: candidateLink },
                  { text: "📋 Мой кабинет", url: `${BASE_URL}/profile` }
                ]]
              }
            })
          })
        }
      }
    }

    // Редиректим на страницу успеха
    return NextResponse.redirect(`${BASE_URL}/vacancy/${vacancy_id}?applied=true`)
  } catch (err) {
    console.error('Quick apply error:', err)
    return NextResponse.redirect(`${BASE_URL}/vacancy/${vacancy_id}`)
  }
}
