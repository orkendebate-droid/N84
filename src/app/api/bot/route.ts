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
    return ctx.reply(`Ошибка входа. Попробуйте /start еще раз.`)
  }

  const loginName = ctx.from?.username?.toLowerCase().replace('@', '') || telegramId.toString()
  await ctx.reply(`Логин: *${loginName}*\nКод: *${code}*`, { parse_mode: 'Markdown' })
}

bot.command('login', sendLoginCode)
bot.callbackQuery('get_login_code', sendLoginCode)

bot.command('start', async (ctx) => {
  ctx.session = { step: 'idle', registration: {} }
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('telegram_id', Number(ctx.from?.id))
    .single()

  if (profile) {
    const keyboard = new InlineKeyboard()
      .webApp('📚 Доска вакансий', 'https://n84-platform.vercel.app/board')
      .row()
      .text('🔑 Получить код для сайта', 'get_login_code')

    return ctx.reply(`Салем, ${profile.full_name || 'дос'}!`, { reply_markup: keyboard })
  }

  const keyboard = new InlineKeyboard().text('🚀 Я ищу работу', 'start_reg_youth')
  ctx.reply('Привет! Давай зарегистрируемся?', { reply_markup: keyboard })
})

bot.callbackQuery('start_reg_youth', async (ctx) => {
  ctx.session.step = 'wait_area'
  await ctx.reply('📍 В каком микрорайоне ты живешь?')
})

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step
  const text = ctx.msg.text
  const telegramId = Number(ctx.from.id)

  if (step === 'wait_area') {
    ctx.session.registration.area = text
    ctx.session.step = 'wait_age'
    return ctx.reply('📅 Сколько тебе лет?')
  }

  if (step === 'wait_age') {
    ctx.session.registration.birthday = text
    ctx.session.step = 'wait_bio'
    return ctx.reply('🎓 О себе (пару слов)?')
  }

  if (step === 'wait_bio') {
    ctx.session.registration.bio = text
    ctx.session.step = 'idle'
    
    // Пытаемся сохранить. Если какая-то колонка еще не видна базе - мы её просто убираем, чтобы регистрация не упала!
    const profileData: any = {
      telegram_id: telegramId,
      username: ctx.from.username?.toLowerCase().replace('@', '') || telegramId.toString(),
      full_name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
      address: ctx.session.registration.area,
      bio: ctx.session.registration.bio,
      role: 'youth',
      updated_at: new Date().toISOString()
    }

    try {
      // Пытаемся добавить возраст в новую колонку
      const { error } = await supabaseAdmin.from('profiles').upsert({
        ...profileData,
        user_age: ctx.session.registration.birthday 
      }, { onConflict: 'telegram_id' })

      if (error) {
        // Если ошибка в колонке user_age - шлем БЕЗ нее, чтобы соотв. прошла
        await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'telegram_id' })
      }
      
      await ctx.reply('🎉 Регистрация завершена!')
    } catch (err) {
      ctx.reply('Ошибка. Попробуй /start')
    }
  }
})

export const POST = webhookCallback(bot, 'std/http')
