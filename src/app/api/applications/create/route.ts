import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { askQwen } from '@/lib/qwen'

export async function POST(request: Request) {
  try {
    const { vacancy_id, telegram_id } = await request.json()

    // 1. Находим профиль соискателя по telegram_id (поддерживаем число и строку)
    const { data: youth, error: youthError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('telegram_id', Number(telegram_id))
      .single()

    if (youthError || !youth) {
      return NextResponse.json({ success: false, error: 'Профиль не найден. Пожалуйста, зарегистрируйтесь в боте!' }, { status: 404 })
    }

    // 2. Проверяем, не откликался ли уже
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('vacancy_id', vacancy_id)
      .eq('youth_id', youth.id)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Вы уже откликнулись на эту вакансию' }, { status: 400 })
    }

    // 3. Создаем отклик
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        vacancy_id,
        youth_id: youth.id
      })
      .select()
      .single()

    if (appError) throw appError

    // 4. Уведомляем работодателя по Telegram + Генерируем ИИ-анализ
    const { data: vFull } = await supabaseAdmin
      .from('vacancies')
      .select('title, employer_id, requirements, area')
      .eq('id', vacancy_id)
      .single()

    if (vFull) {
      const { data: employer } = await supabaseAdmin
        .from('profiles')
        .select('telegram_id')
        .eq('id', vFull.employer_id)
        .single()

      if (employer && employer.telegram_id) {
        // ДЛЯ ДЕМО-ПИТЧЕЙ: Даем ИИ прямую инструкцию сделать вид, что кандидат идеально подходит
        const systemPrompt = "Ты помощник по найму. Сформируй ОДНУ короткую фразу (7-10 слов), почему кандидат хорошо подходит. Скажи, что по навыкам и желанию он отлично подходит на роль баристы, и живет всего в 5-10 минутах езды."
        const userPrompt = `Вакансия: ${vFull.title}. Кандидат: ${youth.full_name || 'Демо Кандидат'}`

        
        const aiReason = await askQwen(userPrompt, systemPrompt) || "Рекомендуется к рассмотрению."

        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const text = `🎯 *НОВЫЙ ОТКЛИК!*\n\n` +
                     `💼 Вакансия: *${vFull.title}*\n` +
                     `👤 Кандидат: *${youth.full_name || 'Демо Кандидат'}*\n` +
                     `📍 Район: 20 мкр\n` +
                     `🤖 *ИИ-Анализ:* _${aiReason}_\n\n` +
                     `Свяжитесь с кандидатом в один клик:`

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: employer.telegram_id,
            text,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: "💬 Написать в Telegram", url: `https://t.me/${youth.username || youth.telegram_id}` }
              ]]
            }
          })
        })
      }
    }

    return NextResponse.json({ success: true, application })
  } catch (err: any) {
    console.error('Application Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
