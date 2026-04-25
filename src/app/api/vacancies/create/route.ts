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
    
    if (matchedUsers && matchedUsers.length > 0 && botToken) {
      for (const user of matchedUsers) {
        if (!user || !user.telegram_id) continue;
        try {
          console.log(`[POST-JOB] Sending notification to ${user.telegram_id}...`);
          const TYPE_LABELS: any = { full_time: 'Полная занятость', part_time: 'Частичная', gig: 'Подработка' }
          const empTypeStr = TYPE_LABELS[employment_type] || employment_type

          const message = `🔥 *НОВАЯ РАБОТА ДЛЯ ТЕБЯ!*\n\n` +
                          `🎯 *Подходимость:* ${user.match_score}/10\n` +
                          `💼 *Професия:* ${title}\n` +
                          `⏳ *Занятость:* ${empTypeStr}\n` +
                          `💰 *Зарплата:* ${salary}\n` +
                          `📍 *Адрес:* ${area}\n\n` +
                          `_Наш ИИ проанализировал твой профиль и считает, что эта вакансия тебе подходит!_`
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: '📂 Подробнее', web_app: { url: `https://n84-platform.vercel.app/vacancy/${vacancy.id}` } }
              ]
            ]
          }

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard
            })
          })
          const tgData = await tgRes.json();
          console.log(`[POST-JOB] Telegram response for ${user.telegram_id}:`, tgData.ok ? 'SUCCESS' : 'FAILED: ' + JSON.stringify(tgData));
        } catch (botErr) {
          console.error(`[POST-JOB] Failed to send to user ${user.telegram_id}`, botErr)
        }
      }
    } else {
       if (!botToken) console.error('[POST-JOB] TELEGRAM_BOT_TOKEN is missing!');
       if (!matchedUsers || matchedUsers.length === 0) console.log('[POST-JOB] No users matched this vacancy.');
    }

    return NextResponse.json({ success: true, vacancy })
  } catch (err: any) {
    console.error('Vacancy Creation Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
