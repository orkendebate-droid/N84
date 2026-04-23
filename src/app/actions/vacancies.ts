'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { askQwen } from '@/lib/qwen'
import { Bot } from 'grammy'

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!)

export async function createVacancyAndNotify(formData: {
  title: string,
  category: string,
  district: string,
  salary: string,
  description: string
}) {
  try {
    // 1. Сохраняем вакансию в БД
    const { data: vacancy, error } = await supabaseAdmin
      .from('vacancies')
      .insert({
        title: formData.title,
        category: formData.category,
        district: formData.district,
        salary: formData.salary,
        description: formData.description,
      })
      .select()
      .single()

    if (error) throw error

    // 2. Получаем всех пользователей (соискателей)
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id, first_name, username, id')

    if (!users || users.length === 0) return { success: true, notifiedCount: 0 }

    // 3. Используем Qwen для подбора
    // Подготовим список кандидатов для ИИ (в реальном проекте лучше фильтровать по району заранее)
    const candidatesList = users.map((u: any) => `ID: ${u.telegram_id}, Name: ${u.first_name}`).join('\n')
    
    const prompt = `
      У нас новая вакансия: "${vacancy.title}"
      Район: ${vacancy.district}
      Описание: ${vacancy.description}
      
      Список кандидатов:
      ${candidatesList}
      
      Напиши только ID тех (через запятую), кому эта вакансия подходит больше всего. Максимум 5 человек.
    `
    
    const matchedIdsRaw = await askQwen(prompt, "Ты — эксперт по подбору кадров в Актау.")
    if (!matchedIdsRaw) return { success: true, notifiedCount: 0 }

    // Извлекаем ID из ответа ИИ
    const matchedIds = matchedIdsRaw.split(',').map(id => id.trim())

    // 4. Рассылаем уведомления через бота
    let count = 0
    for (const tgId of matchedIds) {
      try {
        const id = Number(tgId)
        if (isNaN(id)) continue
        await bot.api.sendMessage(id, 
          `🌟 Специально для тебя!\n\nНашлась новая вакансия: *${vacancy.title}*\n📍 Район: ${vacancy.district}\n💰 Оплата: ${vacancy.salary}\n\nПосмотреть подробнее и откликнуться можно на сайте Saura.`,
          { parse_mode: 'Markdown' }
        )
        count++
      } catch (e) {
        console.error(`Failed to notify ${tgId}:`, e)
      }
    }

    return { success: true, notifiedCount: count }
  } catch (error) {
    console.error('Error in createVacancyAndNotify:', error)
    return { success: false, error: 'Internal server error' }
  }
}
