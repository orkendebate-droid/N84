import { Bot, webhookCallback, InlineKeyboard, session } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

// Интерфейс для хранения состояния регистрации
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

// Используем сессии
bot.use(session({ initial: (): SessionData => ({ step: 'idle', registration: {} }) }))

// КОМАНДА ЛОГИНА (отправляет код)
async function sendLoginCode(ctx: any) {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ otp_code: code })
    .eq('telegram_id', ctx.from?.id.toString())

  if (error) {
    return ctx.reply('Сначала нажми /start, чтобы я тебя запомнил! 😊')
  }

  await ctx.reply(`Твой секретный код для входа: *${code}*\n\nВведите его на сайте в поле «Код подтверждения». 🔐\n_Код действует 10 минут._`, { parse_mode: 'Markdown' })
}

bot.command('login', sendLoginCode)
bot.callbackQuery('get_login_code', sendLoginCode)

bot.command('start', async (ctx) => {
  // Очищаем сессию при новом старте
  ctx.session = { step: 'idle', registration: {} }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('telegram_id', ctx.from?.id.toString())
    .single()

  if (profile) {
    const keyboard = new InlineKeyboard()
      .webApp('📚 Открыть доску вакансий', 'https://n84-platform.vercel.app/board')
      .row()
      .text('🚪 Получить код для входа на сайт', 'get_login_code')

    return ctx.reply(
      `Привет, ${profile.full_name}! 👋\n\nРад тебя видеть. Ты можешь просматривать вакансии прямо здесь или зайти в свой личный кабинет на сайте.`,
      { reply_markup: keyboard }
    )
  }

  const keyboard = new InlineKeyboard()
    .text('📝 Заполнить анкету (Я ищу работу)', 'start_reg_youth')
    .row()
    .text('💼 Я работодатель (на сайт)', 'reg_employer_info')

  ctx.reply(
    'Салем! 🌊 Это N84 — ИИ-платформа для молодежи Актау.\n\nЗаполни анкету за 1 минуту, чтобы получать только те вакансии, которые подходят тебе!',
    { reply_markup: keyboard }
  )
})

bot.callbackQuery('reg_employer_info', (ctx) => {
  ctx.reply('Для бизнеса и работодателей у нас есть удобная веб-панель: https://n84-platform.vercel.app/login\n\nТам вы сможете зарегистрировать компанию и опубликовать вакансии. 🤖🏦')
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.answerCallbackQuery()
  await ctx.reply('Круто! Начнем. 🚀\n\n📍 *Где ты живешь в Актау?*\nНапиши номер микрорайона (например: 14 мкр, 27 мкр).', { parse_mode: 'Markdown' })
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('📊 *Твой возраст?*\n(Напиши просто цифру).')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('🎓 *О тебе и интересах?*\nЧем хочешь заниматься? (Например: IT, Курьер, Официант)')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          telegram_id: ctx.from.id.toString(),
          username: ctx.from.username?.toLowerCase() || null,
          full_name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
          address: ctx.session.registration.area,
          birthday: ctx.session.registration.birthday,
          bio: ctx.session.registration.bio,
          role: 'youth',
          is_verified: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      const keyboard = new InlineKeyboard()
        .webApp('🚀 Посмотреть все вакансии', 'https://n84-platform.vercel.app/board')

      await ctx.reply(
        '🎉 *ПОЗДРАВЛЯЮ!*\nТы в системе. Теперь я буду присылать тебе лучшие вакансии Актау под твой профиль. \n\nМожешь начать просмотр прямо сейчас! 👇', 
        { parse_mode: 'Markdown', reply_markup: keyboard }
      )
    } catch (err) {
      console.error(err)
      ctx.reply('Ошибка сохранения. Попробуй /start снова.')
    }
    return
  }
})

// Feedback Handlers
bot.callbackQuery('feedback_up', async (ctx) => {
  await ctx.answerCallbackQuery('Рады, что попали в точку! 🚀')
})
bot.callbackQuery('feedback_down', async (ctx) => {
  await ctx.answerCallbackQuery('Учтем это при следующем подборе. ⚙️')
})
bot.callbackQuery('reject_vacancy', async (ctx) => {
  await ctx.editMessageText(ctx.msg?.text + '\n\n❌ _Вакансия отклонена._', { parse_mode: 'Markdown' })
})

export const POST = webhookCallback(bot, 'std/http')
