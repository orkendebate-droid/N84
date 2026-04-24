import { Bot, webhookCallback, InlineKeyboard, session } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

// Интерфейс для сессий
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

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ КОДА
async function sendLoginCode(ctx: any) {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  const telegramId = Number(ctx.from?.id) // Конвертируем в число для BIGINT
  
  // Используем UPSERT сразу, так проще и надежнее
  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      telegram_id: telegramId,
      username: ctx.from?.username?.toLowerCase().replace('@', '') || null,
      full_name: `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim() || 'Пользователь',
      otp_code: code,
      updated_at: new Date().toISOString()
    }, { onConflict: 'telegram_id' })

  if (upsertError) {
    console.error('❌ Ошибка при генерации OTP в боте:', upsertError)
    return ctx.reply(`Ошибка при генерации кода: ${upsertError.message}. Попробуйте позже или обратитесь в поддержку.`)
  }

  await ctx.reply(`Ваш секретный код: *${code}*\n\nВведите его на сайте для входа или регистрации. 🔐`, { parse_mode: 'Markdown' })
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
      `Салем, ${profile.full_name || 'друг'}! 👋\n\nВы в системе N84. Используйте кнопки ниже для поиска работы или входа в личный кабинет на сайте.`,
      { reply_markup: keyboard }
    )
  }

  const keyboard = new InlineKeyboard()
    .text('🚀 Я ищу работу (анкета)', 'start_reg_youth')
    .row()
    .text('💼 Я работодатель (бизнес)', 'reg_employer_info')

  ctx.reply(
    'Привет! Это N84 — главная HR-платформа Актау для молодежи. 🌊\n\nДавай определимся, кто ты?',
    { reply_markup: keyboard }
  )
})

bot.callbackQuery('reg_employer_info', (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('🔑 Получить код подтверждения', 'get_login_code')
    .row()
    .url('🌐 Перейти на сайт регистрации', 'https://n84-platform.vercel.app/login')

  ctx.reply(
    '💼 *ДЛЯ РАБОТОДАТЕЛЕЙ:*\n\nРегистрация компаний и управление вакансиями происходит на нашем сайте.\n\n*Инструкция:*\n1️⃣ Перейдите на сайт по кнопке ниже.\n2️⃣ Выберите вкладку "Регистрация бизнеса".\n3️⃣ Нажмите кнопку "Получить код" здесь в боте и введите его на сайте.\n\nЖдем ваши вакансии! 🏦🚀',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.answerCallbackQuery()
  await ctx.reply('Круто! Создаем анкету.\n\n📍 *В каком микрорайоне ты живешь?*\n(Например: 14 мкр, 27 мкр или Самал)', { parse_mode: 'Markdown' })
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text
  const telegramId = Number(ctx.from.id)

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('📊 *Сколько тебе лет?*\n(Напиши цифрой)')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('🎓 *О тебе?*\nЧто ты умеешь или кем хочешь работать?')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          telegram_id: telegramId,
          username: ctx.from.username?.toLowerCase().replace('@', '') || null,
          full_name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim() || 'Студент',
          address: ctx.session.registration.area,
          birthday: ctx.session.registration.birthday,
          bio: ctx.session.registration.bio,
          role: 'youth',
          is_verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_id' })

      if (error) throw error
      await ctx.reply('🎉 *Готoво!* Твоя анкета в базе. Жди уведомления о новых вакансиях! 🔔', { parse_mode: 'Markdown' })
    } catch (err: any) {
      console.error('❌ Ошибка регистрации в боте:', err)
      ctx.reply(`Ошибка: ${err.message}. Попробуй снова /start`)
    }
    return
  }
})

// Feedback Handlers
bot.callbackQuery('feedback_up', async (ctx) => { await ctx.answerCallbackQuery('Рады помочь! 🚀') })
bot.callbackQuery('feedback_down', async (ctx) => { await ctx.answerCallbackQuery('Учтем. ⚙️') })
bot.callbackQuery('reject_vacancy', async (ctx) => { await ctx.editMessageText(ctx.msg?.text + '\n\n❌ _Отклонено._', { parse_mode: 'Markdown' }) })

export const POST = webhookCallback(bot, 'std/http')
