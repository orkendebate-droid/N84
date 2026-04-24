import { qwen } from './qwen'
import { supabaseAdmin } from './supabase'

export async function matchCandidates(vacancy: any) {
  try {
    // 1. Получаем всех ребят (Youth)
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, address, bio, birthday, telegram_id')
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
      ${users.map((u, i) => `${i+1}. [ID: ${u.id}] Проживание: ${u.address}, О себе: ${u.bio}, Возраст: ${u.birthday}`).join('\n')}

      ЗАДАЧА:
      Для каждого кандидата из списка определи оценку совместимости от 0 до 10.
      Учитывай:
      1. Близость района проживания к месту работы.
      2. Соответствие навыков описанию вакансии.
      3. Потенциальную заинтересованность.

      ОТВЕТЬ ТОЛЬКО JSON-массивом объектов в формате:
      [{"id": "id1", "score": 9}, {"id": "id2", "score": 6}]
      Выдай только тех, у кого score >= 5.
    `

    const response = await qwen.chat.completions.create({
      model: "qwen-max",
      messages: [
        { role: "system", content: "You are an AI Job Matching Expert. Respond ONLY with a raw JSON array of objects with 'id' and 'score'." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    const results: any[] = JSON.parse(content || "[]")

    // Склеиваем данные профилей с их оценками
    return results.map(res => {
      const user = users.find(u => u.id === res.id)
      return user ? { ...user, match_score: res.score } : null
    }).filter(Boolean)
  } catch (err) {
    console.error('Matching Error:', err)
    return []
  }
}
