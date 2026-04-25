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

    // --- PITCH SCENARIO OVERRIDE ---
    // Сценарий: всегда отправлять пуш Anime5hka
    
    // МЫ ЖЕСТКО ХАРДКОДИМ ВАШ ID (6681109601)
    // чтобы обойти кэширование базы данных в Next.js (Vercel)
    let targetChatId: string | number = 6681109601;
    let youthIdForCallback = employer_id || vacancy.employer_id;

    // Пытаемся взять ваш ID записи в профиле, чтобы кнопка "Откликнуться" правильно возвращала на ваш профиль
    const { data: pitchYouth } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('telegram_id', 6681109601)
      .single();

    if (pitchYouth) {
      youthIdForCallback = pitchYouth.id;
      if (pitchYouth.telegram_id) {
        targetChatId = Number(pitchYouth.telegram_id);
      }
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (botToken) {
        try {
          console.log(`[PITCH] Sending hardcoded notification to ${targetChatId}...`);
          const TYPE_LABELS: any = { full_time: 'Полная занятость', part_time: 'Частичная', gig: 'Подработка' }
          const empTypeStr = TYPE_LABELS[employment_type] || employment_type

          const message = `🔥 *НОВАЯ РАБОТА ДЛЯ ТЕБЯ!*\n\n` +
                          `🎯 *Подходимость:* 8/10\n` +
                          `💼 *Професия:* ${title}\n` +
                          `⏳ *Занятость:* ${empTypeStr}\n` +
                          `💰 *Зарплата:* ${salary}\n` +
                          `📍 *Адрес:* ${area}\n\n` +
                          `_Наш ИИ проанализировал твой профиль и считает, что эта вакансия тебе подходит!_`
          
          const detailUrl = `https://n84-platform.vercel.app/vacancy/${vacancy.id}`

          const keyboard = {
            inline_keyboard: [
              [
                { text: '📂 Подробнее', url: detailUrl }
              ],
              [
                { text: '✅ Откликнуться', callback_data: `apply_${vacancy.id}_${youthIdForCallback}` }
              ]
            ]
          }

          const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              text: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard
            })
          })
          
          if (!tgResponse.ok) {
            const errorData = await tgResponse.text();
            console.error(`Telegram API error: ${errorData}`);
          }
        } catch (botErr) {
          console.error(`[POST-JOB] Failed to send to user`, botErr)
        }
    }

    return NextResponse.json({ success: true, vacancy })
  } catch (err: any) {
    console.error('Vacancy Creation Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
