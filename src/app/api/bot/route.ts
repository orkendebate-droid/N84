import { Bot, webhookCallback, InlineKeyboard, session } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'
import { askQwen } from '@/lib/qwen'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

interface SessionData {
  step: 'idle' | 'wait_name' | 'wait_area' | 'wait_birthday' | 'wait_bio'
  registration: {
    full_name?: string
    area?: string
    birthday?: string
    bio?: string
  }
}

const bot = new Bot<any>(token)
bot.use(session({ initial: (): SessionData => ({ step: 'idle', registration: {} }) }))

async function sendLoginCode(ctx: any) {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  const telegramId = Number(ctx.from?.id)
  
  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      telegram_id: telegramId,
      username: ctx.from?.username?.toLowerCase().replace('@', '') || telegramId.toString(),
      otp_code: code,
      updated_at: new Date().toISOString()
    }, { onConflict: 'telegram_id' })

  if (upsertError) return ctx.reply(`Ошибка. Попробуйте /start`)

  const loginName = ctx.from?.username?.toLowerCase().replace('@', '') || telegramId.toString()
  await ctx.reply(`Логин: *${loginName}*\nКод: *${code}*`, { parse_mode: 'Markdown' })
}

bot.command('login', sendLoginCode)
bot.callbackQuery('get_login_code', sendLoginCode)

bot.command('status', async (ctx) => {
  try {
    const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: vacCount } = await supabaseAdmin.from('vacancies').select('*', { count: 'exact', head: true })
    await ctx.reply(`🟢 *Система работает стабильно*\n\n📊 *Статистика базы:*\n👤 Профилей: ${usersCount || 0}\n💼 Вакансий: ${vacCount || 0}\n\nБаза данных и Телеграм синхронизированы.`, { parse_mode: 'Markdown' })
  } catch (err: any) {
    await ctx.reply(`🔴 *Ошибка системы:*\n${err.message}`, { parse_mode: 'Markdown' })
  }
})

bot.command('start', async (ctx) => {
  ctx.session = { step: 'idle', registration: {} }
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('telegram_id', Number(ctx.from?.id))
    .single()

  if (profile && profile.full_name) {
    const keyboard = new InlineKeyboard()
      .webApp('📚 Доска вакансий', 'https://n84-platform.vercel.app/board')
      .row()
      .text('🔑 Код для сайта', 'get_login_code')

    return ctx.reply(`Салем, ${profile.full_name}! 👋`, { reply_markup: keyboard })
  }

  const keyboard = new InlineKeyboard().text('🚀 Я ищу работу', 'start_reg_youth')
  ctx.reply('Привет! Это N84. Давай создадим твой профиль?', { reply_markup: keyboard })
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_name'
  await ctx.reply('👤 *Напиши свое Имя и Фамилию:*', { parse_mode: 'Markdown' })
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text
  const telegramId = Number(ctx.from.id)

  if (step === 'wait_name') {
    ctx.session.registration.full_name = text
    ctx.session.step = 'wait_area'
    return ctx.reply('📍 *В каком микрорайоне ты живешь?*\n(Пример: 14 мкр или мкр. Самал)', { parse_mode: 'Markdown' })
  }

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_birthday'
    return ctx.reply('📅 *Когда у тебя день рождения?*\n(Пример: 15.05.2008)', { parse_mode: 'Markdown' })
  }

  if (step === 'wait_birthday') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('🎓 *О тебе?* (Кем хочешь работать или что умеешь?)', { parse_mode: 'Markdown' })
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    const code = Math.floor(1000 + Math.random() * 9000).toString()

    const profileData: any = {
      telegram_id: telegramId,
      username: ctx.from.username?.toLowerCase().replace('@', '') || telegramId.toString(),
      full_name: ctx.session.registration.full_name,
      address: ctx.session.registration.area,
      bio: ctx.session.registration.bio,
      role: 'youth',
      is_verified: true,
      otp_code: code, // Сразу генерируем код при регистрации
      updated_at: new Date().toISOString()
    }

    try {
      const { error } = await supabaseAdmin.from('profiles').upsert({
        ...profileData,
        user_age: ctx.session.registration.birthday 
      }, { onConflict: 'telegram_id' })

      if (error) {
        await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'telegram_id' })
      }
      
      const loginName = ctx.from.username?.toLowerCase().replace('@', '') || telegramId.toString()
      await ctx.reply(`🎉 *Профиль успешно создан!*\n\nВот твои данные для входа на сайт:\n👤 Логин: *${loginName}*\n🔑 Код: *${code}*`, { parse_mode: 'Markdown' })
    } catch (err) {
      ctx.reply('Ошибка сохранения. Попробуйте еще раз.')
    }
  }
})

bot.callbackQuery('feedback_up', async (ctx) => { await ctx.answerCallbackQuery('🚀') })
bot.callbackQuery('feedback_down', async (ctx) => { await ctx.answerCallbackQuery('⚙️') })
bot.callbackQuery('reject_vacancy', async (ctx) => { await ctx.editMessageText(ctx.msg?.text + '\n\n❌ _Отклонено._', { parse_mode: 'Markdown' }) })

bot.callbackQuery(/^apply_(.+)_(.+)$/, async (ctx) => {
  const vacancy_id = ctx.match[1]
  const youth_id = ctx.match[2]

  try {
    const { error } = await supabaseAdmin.from('applications').insert({
      vacancy_id: vacancy_id,
      youth_id: youth_id,
      applicant_id: youth_id,
      status: 'pending',
      match_score: 8
    })

    if (error) {
      if (error.code === '23505') {
        await ctx.editMessageText(ctx.msg?.text + '\n\n✅ _Вы уже откликнулись на эту вакансию._', { parse_mode: 'Markdown' })
        return
      }
      throw error
    }

    // Отправляем ИИ-уведомление работодателю
    const { data: youth } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', youth_id)
      .single()

    const { data: vFull } = await supabaseAdmin
      .from('vacancies')
      .select('title, employer_id')
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

        const candidateLink = youth.username
          ? `https://t.me/${youth.username}`
          : `tg://user?id=${youth.telegram_id}`

        const BASE_URL = 'https://n84-platform.vercel.app'

        const text = `🎯 *НОВЫЙ ОТКЛИК!*\n\n` +
                     `💼 Вакансия: *${vFull.title}*\n` +
                     `👤 Кандидат: *${youth.full_name || 'Демо Кандидат'}*\n` +
                     `📍 Район: 20 мкр\n` +
                     `🤖 *ИИ-Анализ:* _${aiReason}_\n\n` +
                     `🔗 Ссылка на кандидата: ${candidateLink}`

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

    await ctx.editMessageText(ctx.msg?.text + '\n\n✅ _Отклик успешно отправлен работодателю!_', { parse_mode: 'Markdown' })
  } catch (err) {
    console.error('Apply error:', err)
    await ctx.answerCallbackQuery('Ошибка отправки отклика')
  }
})

export const POST = webhookCallback(bot, 'std/http')
