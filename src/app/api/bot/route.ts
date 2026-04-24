import { Bot, webhookCallback, InlineKeyboard, session } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

// Интерфейс для хранения состояния регистрации
interface SessionData {
  step: 'idle' | 'wait_name' | 'wait_area' | 'wait_age' | 'wait_bio'
  registration: {
    full_name?: string
    area?: string
    birthday?: string
    bio?: string
  }
}

const bot = new Bot<any>(token)

// Используем сессии для хранения шага регистрации
bot.use(session({ initial: (): SessionData => ({ step: 'idle', registration: {} }) }))

bot.command('start', async (ctx) => {
  const username = ctx.from?.username?.toLowerCase()
  
  // Проверяем, есть ли уже такой пользователь
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('telegram_id', ctx.from?.id)
    .single()

  if (profile) {
    return ctx.reply(`Рад тебя видеть снова, ${profile.full_name}! 👋\nЯ сообщу тебе, как только появится подходящая работа в Актау.`)
  }

  const keyboard = new InlineKeyboard()
    .text('🚀 Найти работу', 'view_recent_jobs')
    .row()
    .text('💼 Я работодатель', 'reg_employer_info')

  ctx.reply(
    'Привет! Это N84 — платформа для поиска работы молодежи в Актау. 🌊\n\nБот поможет тебе найти подработку или первую работу прямо в твоем микрорайоне.',
    { reply_markup: keyboard }
  )
})

bot.callbackQuery('reg_employer_info', (ctx) => {
  ctx.reply('Для работодателей у нас есть удобный сайт: https://n84-platform.vercel.app\n\nЗайдите туда, чтобы опубликовать вакансию! 💼')
})

bot.callbackQuery('view_recent_jobs', async (ctx) => {
  await ctx.answerCallbackQuery()
  
  // Берем последние 5 вакансий
  const { data: vacancies } = await supabaseAdmin
    .from('vacancies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!vacancies || vacancies.length === 0) {
    return ctx.reply('К сожалению, сейчас новых вакансий нет. Попробуй позже! 👋')
  }

  await ctx.reply('📋 *ПОДБОРКА СВЕЖИХ ВАКАНСИЙ ДЛЯ ТЕБЯ:*', { parse_mode: 'Markdown' })

  for (const v of vacancies) {
    const message = `🏷️ *Название:* ${v.title}\n💰 *Зарплата:* ${v.salary}\n📍 *Район:* ${v.area}`
    const keyboard = new InlineKeyboard()
      .webApp('Подробнее 📍', `https://n84-platform.vercel.app/vacancy/${v.id}`)
    
    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  }

  const moreKeyboard = new InlineKeyboard()
    .webApp('📚 Открыть всю доску', 'https://n84-platform.vercel.app/board')
    .row()
    .text('📝 Создать анкету', 'start_reg_youth')

  await ctx.reply('Хочешь увидеть больше или настроить уведомления?', { reply_markup: moreKeyboard })
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.answerCallbackQuery()
  await ctx.reply('Отлично! Давай создадим твой профиль. 📝\n\nВ каком микрорайоне или районе Актау ты живешь?\n(Напиши, например: 14 мкр или Верхняя зона)')
})

// Обработка текстовых сообщений (анкета)
bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('Принято! Теперь напиши свой возраст (например: 19 лет).')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('Какие у тебя есть навыки или чем ты хочешь заниматься?\n(Например: умею монтировать видео, хочу работать официантом или курьером)')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    try {
      // Сохраняем в Supabase
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          telegram_id: ctx.from.id,
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

      await ctx.reply('✅ Поздравляю! Твоя анкета создана.\n\nТеперь я буду присылать тебе лучшие вакансии Актау, которые подходят именно тебе. Как только что-то найдется — я сразу напишу! 🔔')
    } catch (err) {
      console.error(err)
      ctx.reply('Упс, произошла ошибка при сохранении анкеты. Попробуйте еще раз позже.')
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
