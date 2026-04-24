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
      Зарплата: ${vacancy.salary}
      Описание: ${vacancy.description}
      Требования: ${vacancy.requirements}

      СПИСОК КАНДИДАТОВ:
      ${users.map((u, i) => `${i+1}. [ID: ${u.id}] Проживание: ${u.address}, О себе: ${u.bio}, Возраст: ${u.birthday}`).join('\n')}

      ЗАДАЧА:
      Выбери до 10 наиболее подходящих кандидатов из списка выше. 
      Учитывай:
      1. Близость района проживания к месту работы (Актау - микрорайоны).
      2. Соответствие навыков описанию вакансии.
      3. Возраст (если работа для школьников).

      ОТВЕТЬ ТОЛЬКО JSON-массивом ID подходящих пользователей в формате:
      ["id1", "id2", ...]
    `

    const response = await qwen.chat.completions.create({
      model: "qwen-max",
      messages: [
        { role: "system", content: "You are an AI Job Matching Expert for N84 platform in Aktau. Respond ONLY with a raw JSON array of strings." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    const matchedIds: string[] = JSON.parse(content || "[]")

    // Возвращаем полные профили выбранных ребят
    return users.filter(u => matchedIds.includes(u.id))
  } catch (err) {
    console.error('Matching Error:', err)
    return [] // В случае ошибки возвращаем пустой список или можно вернуть всех как фолбек
  }
}
