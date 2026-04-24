import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
      .eq('applicant_id', youth.id)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Вы уже откликнулись на эту вакансию' }, { status: 400 })
    }

    // 3. Создаем отклик
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        vacancy_id,
        applicant_id: youth.id
      })
      .select()
      .single()

    if (appError) throw appError

    // 4. Уведомляем работодателя по Telegram
    // Сначала находим работодателя вакансии
    const { data: vacancy } = await supabaseAdmin
      .from('vacancies')
      .select('title, employer_id')
      .eq('id', vacancy_id)
      .single()

    if (vacancy) {
      const { data: employer } = await supabaseAdmin
        .from('profiles')
        .select('telegram_id')
        .eq('id', vacancy.employer_id)
        .single()

      if (employer && employer.telegram_id) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const text = `🎯 *НОВЫЙ ОТКЛИК!*\n\n` +
                     `💼 Вакансия: *${vacancy.title}*\n` +
                     `👤 Кандидат: *${youth.full_name}*\n` +
                     `📍 Район: ${youth.address || 'Не указан'}\n\n` +
                     `Посмотрите подробности в личном кабинете на сайте!`

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: employer.telegram_id,
            text,
            parse_mode: 'Markdown'
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
