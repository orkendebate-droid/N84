import { Bot, webhookCallback, InlineKeyboard, session } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

interface SessionData {
  step: 'idle' | 'wait_area' | 'wait_age' | 'wait_bio'
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
      full_name: `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim() || 'Пользователь',
      otp_code: code,
      updated_at: new Date().toISOString()
    }, { onConflict: 'telegram_id' })

  if (upsertError) {
    console.error('❌ OTP Error:', upsertError)
    return ctx.reply(`Ошибка: ${upsertError.message}.`)
  }

  const loginName = ctx.from?.username?.toLowerCase().replace('@', '') || telegramId.toString()
  await ctx.reply(`Ваш логин: *${loginName}*\nВаш код: *${code}*\n\nВведите их на сайте. 🔐`, { parse_mode: 'Markdown' })
}

bot.command('login', sendLoginCode)
bot.callbackQuery('get_login_code', sendLoginCode)

bot.command('start', async (ctx) => {
  ctx.session = { step: 'idle', registration: {} }
  const telegramId = Number(ctx.from?.id)

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()

  if (profile) {
    const keyboard = new InlineKeyboard()
      .webApp('📚 Доска вакансий', 'https://n84-platform.vercel.app/board')
      .row()
      .text('🔑 Получить код для сайта', 'get_login_code')

    return ctx.reply(
      `Салем, ${profile.full_name || 'друг'}! 👋\n\nВы в системе N84.`,
      { reply_markup: keyboard }
    )
  }

  const keyboard = new InlineKeyboard()
    .text('🚀 Я ищу работу', 'start_reg_youth')
    .row()
    .text('💼 Я работодатель', 'reg_employer_info')

  ctx.reply('Привет! Это N84. Кто ты?', { reply_markup: keyboard })
})

bot.callbackQuery('reg_employer_info', (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('🔑 Получить код', 'get_login_code')
    .row()
    .url('🌐 Перейти на сайт', 'https://n84-platform.vercel.app/login')
  ctx.reply('💼 Инфо для бизнеса...', { reply_markup: keyboard })
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.answerCallbackQuery()
  await ctx.reply('📍 *В каком микрорайоне ты живешь?*', { parse_mode: 'Markdown' })
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text
  const telegramId = Number(ctx.from.id)

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('📅 *Напиши дату рождения или сколько тебе лет?*\n(Например: 15 или 20.05.2008)')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('🎓 *О тебе?*')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          telegram_id: telegramId,
          username: ctx.from.username?.toLowerCase().replace('@', '') || telegramId.toString(),
          full_name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim() || 'Студент',
          address: ctx.session.registration.area,
          user_age: ctx.session.registration.birthday, // Используем ТОЛЬКО новую колонку
          bio: ctx.session.registration.bio,
          role: 'youth',
          is_verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_id' })

      if (error) throw error
      await ctx.reply('🎉 *Готово!* Анкета в базе.', { parse_mode: 'Markdown' })
    } catch (err: any) {
      ctx.reply(`Ошибка: ${err.message}`)
    }
  }
})

bot.callbackQuery('feedback_up', async (ctx) => { await ctx.answerCallbackQuery('🚀') })
bot.callbackQuery('feedback_down', async (ctx) => { await ctx.answerCallbackQuery('⚙️') })
bot.callbackQuery('reject_vacancy', async (ctx) => { await ctx.editMessageText(ctx.msg?.text + '\n\n❌ _Отклонено._', { parse_mode: 'Markdown' }) })

export const POST = webhookCallback(bot, 'std/http')
