import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

const bot = new Bot(token)

// Обработка /start с параметром (например, /start reg_123)
bot.command('start', async (ctx) => {
  const payload = ctx.match
  const username = ctx.from?.username?.toLowerCase()
  
  // 1. Если зашли по прямой ссылке с ID
  if (payload && payload.startsWith('reg_')) {
    const profileId = payload.replace('reg_', '')
    return await showVerifyPrompt(ctx, profileId)
  }

  // 2. Если просто нажали Старт, попробуем найти недавнюю регистрацию по юзернейму
  if (username) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (profile) {
      return await showVerifyPrompt(ctx, profile.id)
    }
  }

  ctx.reply('Привет! Я бот платформы N84. 🚀\n\nЯ не нашел активных запросов на регистрацию для вашего аккаунта. Пожалуйста, зарегистрируйтесь на сайте n84-platform.vercel.app')
})

async function showVerifyPrompt(ctx: any, profileId: string) {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profile) {
      const keyboard = new InlineKeyboard()
        .text('✅ Это я', `verify_yes_${profileId}`)
        .text('❌ Не я (игнорировать)', `verify_no_${profileId}`)

      return ctx.reply(
        `🔔 *ЗАПРОС НА ПОДТВЕРЖДЕНИЕ*\n\nКто-то зарегистрировался на N84 как:\n👤 *${profile.full_name}*\n\nЭто вы?`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      )
    }
  } catch (err) {
    console.error(err)
  }
}

// Обработка нажатий на кнопки
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data

  if (data.startsWith('verify_yes_')) {
    const profileId = data.replace('verify_yes_', '')
    if (!ctx.from) return
    
    try {
      await supabaseAdmin
        .from('profiles')
        .update({
          is_verified: true,
          telegram_id: ctx.from.id,
          username: ctx.from.username || null
        })
        .eq('id', profileId)

      await ctx.answerCallbackQuery('Успешно подтверждено!')
      await ctx.editMessageText('✅ *Поздравляем!*\n\nВаш аккаунт успешно подтвержден. Теперь вы можете вернуться на сайт и пользоваться платформой N84.', { parse_mode: 'Markdown' })
    } catch (err) {
      await ctx.answerCallbackQuery('Ошибка базы данных')
    }
  } else if (data.startsWith('verify_no_')) {
    await ctx.answerCallbackQuery('Понял, отклоняю')
    await ctx.editMessageText('❌ *Доступ отклонен.*\n\nМы не подтвердили этот аккаунт. Если это были не вы, не переживайте — ваша безопасность под контролем.', { parse_mode: 'Markdown' })
  }
})

export const POST = webhookCallback(bot, 'std/http')
