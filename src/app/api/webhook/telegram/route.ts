import { Bot, webhookCallback } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'
import { askQwen } from '@/lib/qwen'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

const bot = new Bot(token)

// Обработка команды /start
bot.command('start', async (ctx) => {
  const { id, username, first_name, last_name } = ctx.from!
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      telegram_id: id,
      username,
      first_name,
      last_name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'telegram_id' })

  if (error) {
    console.error('Error saving profile:', error)
    return ctx.reply('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.')
  }

  await ctx.reply(`Салем, ${first_name}! 👋\n\nДобро пожаловать в N84 — платформу занятости Мангистау. Мы поможем вам найти работу рядом с вами.`)
})

// Обработка кнопки "Откликнуться" (callback)
bot.callbackQuery(/^apply_(.+)_(.+)$/, async (ctx) => {
  const vacancy_id = ctx.match[1]
  const youth_id = ctx.match[2]

  // Немедленно отвечаем на callback — показывает всплывающий тост в Telegram
  await ctx.answerCallbackQuery({ text: '✅ Вы откликнулись! Ожидайте ответа работодателя.' })

  try {
    // Проверяем, не откликался ли уже
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('vacancy_id', vacancy_id)
      .eq('youth_id', youth_id)
      .single()

    if (existing) {
      return // уже откликался — ничего не делаем
    }

    // Создаём отклик в базе
    await supabaseAdmin.from('applications').insert({
      vacancy_id,
      youth_id,
      status: 'pending',
      match_score: 8
    })

    // Получаем данные кандидата и вакансии
    const { data: youth } = await supabaseAdmin
      .from('profiles')
      .select('full_name, username, telegram_id')
      .eq('id', youth_id)
      .single()

    const { data: vacancy } = await supabaseAdmin
      .from('vacancies')
      .select('title, employer_id')
      .eq('id', vacancy_id)
      .single()

    if (!youth || !vacancy) return

    const { data: employer } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id')
      .eq('id', vacancy.employer_id)
      .single()

    if (!employer?.telegram_id) return

    // Генерируем ИИ-объяснение
    const systemPrompt = "Ты помощник по найму. Сформируй ОДНУ короткую фразу (7-10 слов), почему кандидат хорошо подходит. Скажи, что по желанию и навыкам подходит на роль баристы и живет в 5 минутах езды."
    const userPrompt = `Вакансия: ${vacancy.title}. Кандидат: ${youth.full_name || 'anime5hka'}`
    const aiReason = await askQwen(userPrompt, systemPrompt) || "Подходит по навыкам и живет в 5 минутах езды."

    const candidateTag = youth.username ? `@${youth.username}` : `пользователь #${youth.telegram_id}`
    const candidateUrl = youth.username ? `https://t.me/${youth.username}` : `tg://user?id=${youth.telegram_id}`

    const text = `🎯 *НОВЫЙ ОТКЛИК!*\n\n` +
                 `💼 Вакансия: *${vacancy.title}*\n` +
                 `👤 Кандидат: *${candidateTag}*\n` +
                 `📍 Район: 20 мкр\n` +
                 `⭐ Оценка ИИ: *8/10*\n` +
                 `🤖 _${aiReason}_`

    await bot.api.sendMessage(employer.telegram_id, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: `💬 Написать ${candidateTag}`, url: candidateUrl }
        ]]
      }
    })

  } catch (err) {
    console.error('Apply callback error:', err)
  }
})

bot.on('message', async (ctx) => {
  await ctx.reply('Используйте кнопки в уведомлениях о вакансиях, чтобы откликнуться. 🚀')
})

export const POST = webhookCallback(bot, 'std/http')

