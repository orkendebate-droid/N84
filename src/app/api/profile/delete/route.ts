import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    // 1. Удаляем отклики (applications), где этот пользователь — соискатель
    const { error: appErr1 } = await supabaseAdmin
      .from('applications')
      .delete()
      .eq('youth_id', id)

    if (appErr1) {
      console.error('[DELETE] Ошибка при удалении откликов соискателя:', appErr1)
      throw appErr1
    }

    // 2. Находим все вакансии этого работодателя
    const { data: vacancyRows, error: vacFetchErr } = await supabaseAdmin
      .from('vacancies')
      .select('id')
      .eq('employer_id', id)

    if (vacFetchErr) {
      console.error('[DELETE] Ошибка при получении вакансий:', vacFetchErr)
      throw vacFetchErr
    }

    if (vacancyRows && vacancyRows.length > 0) {
      const vacancyIds = vacancyRows.map((v: any) => v.id)

      // 3. Удаляем все отклики на эти вакансии
      const { error: appErr2 } = await supabaseAdmin
        .from('applications')
        .delete()
        .in('vacancy_id', vacancyIds)

      if (appErr2) {
        console.error('[DELETE] Ошибка при удалении откликов на вакансии:', appErr2)
        throw appErr2
      }

      // 4. Удаляем сами вакансии
      const { error: vacDelErr } = await supabaseAdmin
        .from('vacancies')
        .delete()
        .eq('employer_id', id)

      if (vacDelErr) {
        console.error('[DELETE] Ошибка при удалении вакансий:', vacDelErr)
        throw vacDelErr
      }
    }

    // 5. Наконец удаляем сам профиль
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileErr) {
      console.error('[DELETE] Ошибка при удалении профиля:', profileErr)
      throw profileErr
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE] Критическая ошибка:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
