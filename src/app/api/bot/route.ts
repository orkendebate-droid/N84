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

bot.command('login', async (ctx) => {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ otp_code: code })
    .eq('telegram_id', ctx.from?.id.toString())

  if (error) {
    return ctx.reply('Сначала нажми /start, чтобы я тебя запомнил! 😊')
  }

  await ctx.reply(`Твой секретный код для входа: *${code}*\n\nВведите его на сайте, чтобы подтвердить личность. 🔐`, { parse_mode: 'Markdown' })
})

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
      .text('👤 Мой профиль на сайте', 'reg_employer_info') // Показываем ссылку на сайт

    return ctx.reply(
      `Привет, ${profile.full_name}! 👋\n\nЯ уже знаю тебя. Как только появится подходящая работа в твоем районе (*${profile.address}*), я сразу пришлю тебе пуш! 🔔`,
      { reply_markup: keyboard }
    )
  }

  const keyboard = new InlineKeyboard()
    .text('📝 Заполнить анкету и получать работу', 'start_reg_youth')
    .row()
    .text('💼 Я работодатель (на сайт)', 'reg_employer_info')

  ctx.reply(
    'Салем! 🌊 Это N84 — ИИ-платформа для поиска работы молодежи в Актау.\n\nЗаполни анкету за 1 минуту, и я буду присылать тебе только те вакансии, которые подходят тебе по району и интересам!',
    { reply_markup: keyboard }
  )
})

bot.callbackQuery('reg_employer_info', (ctx) => {
  ctx.reply('Для бизнеса и работодателей у нас есть удобная веб-панель: https://n84-platform.vercel.app\n\nТам вы сможете подтвердить свою компанию (БИН) и опубликовать вакансии. 🤖🏦')
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.answerCallbackQuery()
  await ctx.reply('Круто! Начнем. 🚀\n\n📍 *Где ты живешь в Актау?*\nНапиши номер микрорайона (например: 14 мкр, 27 мкр или Приозёрный).', { parse_mode: 'Markdown' })
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('Запомнил! ✅\n\n📊 *Твой возраст?*\n(Напиши просто цифру, например: 18)')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('И последнее... ✍️\n\n🎓 *О себе и своих интересах?*\nЧем хочешь заниматься? Что умеешь? (Например: Продажи, IT, Курьер, Официант, Бариста)')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    try {
      // Сохраняем ТОЛЬКО как youth
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          telegram_id: ctx.from.id.toString(),
          username: ctx.from.username?.toLowerCase() || null,
          full_name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
          address: ctx.session.registration.area,
          birthday: ctx.session.registration.birthday,
          bio: ctx.session.registration.bio,
          role: 'youth', // ГАРАНТИЯ: только молодежь
          is_verified: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      const keyboard = new InlineKeyboard()
        .webApp('🚀 Посмотреть все вакансии', 'https://n84-platform.vercel.app/board')

      await ctx.reply(
        '🎉 *ПОЗДРАВЛЯЮ, ТЫ В СИСТЕМЕ!*\n\nТеперь ты будешь получать уведомления о лучших вакансиях Актау. Я подберу их специально под тебя. \n\nПока можешь посмотреть, что есть на доске сейчас! 👇', 
        { parse_mode: 'Markdown', reply_markup: keyboard }
      )
    } catch (err) {
      console.error(err)
      ctx.reply('Упс, что-то пошло не так при сохранении анкеты. Попробуй нажать /start еще раз.')
    }
    return
  }
})

// Feedback Handlers
bot.callbackQuery('feedback_up', async (ctx) => {
  await ctx.answerCallbackQuery('Рады, что попали в точку! Поиск станет ещё лучше. 🚀')
})

bot.callbackQuery('feedback_down', async (ctx) => {
  await ctx.answerCallbackQuery('Поняли вас. ИИ учтет это и подберет другие варианты. ⚙️')
})

bot.callbackQuery('reject_vacancy', async (ctx) => {
  await ctx.editMessageText(ctx.msg?.text + '\n\n❌ _Эта вакансия была вами отклонена._', { parse_mode: 'Markdown' })
  await ctx.answerCallbackQuery('Вакансия скрыта.')
})

export const POST = webhookCallback(bot, 'std/http')
