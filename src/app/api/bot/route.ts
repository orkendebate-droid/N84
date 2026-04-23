import { Bot, webhookCallback } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

const bot = new Bot(token)

// Обработка команды /start
bot.command('start', (ctx) => 
  ctx.reply('Привет! Я бот платформы N84. 🚀\n\nЧтобы подтвердить свой аккаунт, отправьте команду:\n/verify [ваш_код_с_сайта]')
)

// Обработка команды /verify [code]
bot.command('verify', async (ctx) => {
  const code = ctx.match
  if (!code) return ctx.reply('Пожалуйста, укажите код. Пример: /verify 1234')

  try {
    // Ищем пользователя с таким кодом
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('verification_code', code)
      .single()

    if (error || !profile) {
      return ctx.reply('❌ Ошибка: Неверный код. Проверьте число на сайте N84.')
    }

    if (profile.is_verified) {
      return ctx.reply('✅ Ваш аккаунт уже подтвержден!')
    }

    // Обновляем профиль
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_verified: true,
        telegram_id: ctx.from.id,
        username: ctx.from.username || profile.username
      })
      .eq('id', profile.id)

    if (updateError) throw updateError

    ctx.reply(`✅ Успех! Аккаунт ${profile.full_name} подтвержден. Теперь вы можете пользоваться всеми функциями N84!`)
    
  } catch (err) {
    console.error(err)
    ctx.reply('⚠️ Произошла ошибка при верификации. Попробуйте позже.')
  }
})

export const POST = webhookCallback(bot, 'std/http')
