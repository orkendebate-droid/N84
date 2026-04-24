import { askQwen } from './qwen'
import { supabaseAdmin } from './supabase'

export async function matchCandidates(vacancy: any) {
  try {
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, address, bio, user_age, telegram_id')
      .eq('role', 'youth')
      .not('telegram_id', 'is', null)

    if (!users || users.length === 0) return []

    const prompt = `
      ВАКАНСИЯ:
      Название: ${vacancy.title}
      Место: ${vacancy.area}
      Сфера: ${vacancy.industry}
      Зарплата: ${vacancy.salary}
      Описание: ${vacancy.description}

      СПИСОК КАНДИДАТОВ:
      ${users.map((u, i) => `${i+1}. [ID: ${u.id}] Проживание: ${u.address}, О себе: ${u.bio}, Возраст: ${u.user_age}`).join('\n')}

      ЗАДАЧА:
      Для каждого кандидата определи оценку совместимости от 0 до 10.
      Выдай только тех, у кого score >= 5.

      ОТВЕТЬ ТОЛЬКО JSON-массивом: [{"id": "uuid", "score": 9}]
    `

    const systemPrompt = "You are a Job Matching AI. Return ONLY valid JSON array. No markdown, no code blocks, no text."
    const content = await askQwen(prompt, systemPrompt)
    
    if (!content) return []

    // Очистка от markdown-блоков (```json ... ```), если ИИ их добавил
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let results: any[] = []
    try {
      results = JSON.parse(cleanJson)
    } catch (e) {
      console.error('Failed to parse AI matching result:', cleanJson)
      return []
    }

    if (!Array.isArray(results)) return []

    return results.map(res => {
      const user = users.find(u => u.id === res.id)
      return user ? { ...user, match_score: res.score } : null
    }).filter((u): u is any => u !== null)

  } catch (err) {
    console.error('Matching Error:', err)
    return []
  }
}
