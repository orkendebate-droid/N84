import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

const bot = new Bot(token)

// Обработка /start с параметром (например, /start reg_123)
bot.command('start', async (ctx) => {
  const payload = ctx.match
  
  if (payload && payload.startsWith('reg_')) {
    const profileId = payload.replace('reg_', '')
    
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (profile) {
        const keyboard = new InlineKeyboard()
          .text('✅ Да, это я', `verify_yes_${profileId}`)
          .text('❌ Нет, не я', `verify_no_${profileId}`)

        return ctx.reply(
          `👋 Привет, ${ctx.from.first_name}!\n\nКто-то (возможно, вы) зарегистрировался на платформе N84 под именем:\n\n👤 *${profile.full_name}*\n\nЭто ваш аккаунт?`,
          { parse_mode: 'Markdown', reply_markup: keyboard }
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  ctx.reply('Привет! Я бот платформы N84. 🚀\nЗарегистрируйтесь на сайте, чтобы получить доступ ко всем функциям!')
})

// Обработка нажатий на кнопки
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data

  if (data.startsWith('verify_yes_')) {
    const profileId = data.replace('verify_yes_', '')
    
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
