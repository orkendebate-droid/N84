import { Bot, webhookCallback } from 'grammy'
import { supabaseAdmin } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

const bot = new Bot(token)

// Обработка команды /start
bot.command('start', async (ctx) => {
  const { id, username, first_name, last_name } = ctx.from!
  
  // Проверяем/создаем профиль в Supabase
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      telegram_id: id,
      username,
      first_name,
      last_name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'telegram_id' })
    .select()

  if (error) {
    console.error('Error saving profile:', error)
    return ctx.reply('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.')
  }

  await ctx.reply(`Салем, ${first_name}! 👋\n\nДобро пожаловать в Saura — платформу занятости Мангистау. Мы поможем вам найти работу или сотрудников рядом с вами.`)
})

// Простой эхо-ответ для проверки
bot.on('message', async (ctx) => {
  await ctx.reply('Я получил ваше сообщение! Скоро я научусь помогать вам с поиском вакансий. 🚀')
})

export const POST = webhookCallback(bot, 'std/http')
