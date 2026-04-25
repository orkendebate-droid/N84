import { supabaseAdmin } from './supabase'

export async function matchCandidates(vacancy: any) {
  try {
    // ДЛЯ ДЕМО-ПИТЧЕЙ: Чтобы работодатель (anime5hka) сам получил пуш-уведомление как "молодежь"
    const { data: employer } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', vacancy.employer_id)
      .single()

    if (employer && employer.telegram_id) {
       console.log(`[PITCH DEMO] Returning the employer themselves as the matching youth!`);
       return [{
          id: employer.id,
          telegram_id: employer.telegram_id,
          full_name: employer.full_name || 'Демо Кандидат',
          username: employer.username || 'anime5hka',
          address: '20 мкр',
          bio: 'хочет любую роботу но хорошо подходит как бариста',
          user_age: '18',
          match_score: 8
       }]
    }

    return []
  } catch (err) {
    console.error('Matching Error:', err)
    return []
  }
}

