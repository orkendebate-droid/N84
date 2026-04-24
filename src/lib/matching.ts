import { qwen } from './qwen'
import { supabaseAdmin } from './supabase'

export async function matchCandidates(vacancy: any) {
  try {
    // 1. Получаем всех ребят (Youth) — используем user_age вместо заблокированной birthday
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, address, bio, user_age, telegram_id')
      .eq('role', 'youth')
      .not('telegram_id', 'is', null)

    if (!users || users.length === 0) return []

    // 2. Формируем запрос для ИИ
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
      Для каждого кандидата из списка определи оценку совместимости от 0 до 10.
      Выдай только тех, у кого score >= 5.

      ОТВЕТЬ ТОЛЬКО JSON-массивом: [{"id": "id1", "score": 9}, {"id": "id2", "score": 6}]
    `

    const response = await qwen.chat.completions.create({
      model: "qwen-max",
      messages: [
        { role: "system", content: "You are an AI Job Matching Expert. Respond ONLY with a raw JSON array like: [{\"id\": \"uuid\", \"score\": 8}]. No extra text." },
        { role: "user", content: prompt }
      ]
    })

    const content = response.choices[0].message.content || '[]'
    
    // Безопасный парсинг: Qwen иногда оборачивает массив в объект
    let results: any[] = []
    try {
      const parsed = JSON.parse(content)
      // Если пришел объект вместо массива, ищем массив внутри него
      results = Array.isArray(parsed) ? parsed : (Object.values(parsed).find(v => Array.isArray(v)) as any[] || [])
    } catch {
      results = []
    }

    return results.map(res => {
      const user = users.find(u => u.id === res.id)
      return user ? { ...user, match_score: res.score } : null
    }).filter((u): u is any => u !== null)

  } catch (err) {
    console.error('Matching Error:', err)
    return []
  }
}
