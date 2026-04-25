'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, DollarSign, Briefcase, Clock, Loader2, CheckCircle, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VacancyDetailPage() {
  const params = useParams()
  const [vacancy, setVacancy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVacancy()
  }, [])

  const fetchVacancy = async () => {
    try {
      const res = await fetch(`/api/vacancies/get?id=${params.id}`)
      const data = await res.json()
      if (data.success) setVacancy(data.vacancy)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setError('')
    setApplying(true)

    // Приоритет: Telegram WebApp → сессия сайта
    let telegramId: string | null = null
    const tg = (window as any).Telegram?.WebApp
    const tgUser = tg?.initDataUnsafe?.user
    if (tgUser?.id) {
      telegramId = String(tgUser.id)
    } else {
      // Пробуем сессию сайта (профиль сохранён в localStorage)
      const saved = localStorage.getItem('n84_user')
      if (saved) {
        const profile = JSON.parse(saved)
        telegramId = profile.telegram_id ? String(profile.telegram_id) : null
      }
    }

    if (!telegramId) {
      setError('Войдите в систему через бот или сайт, чтобы откликнуться!')
      setApplying(false)
      return
    }

    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancy_id: vacancy.id, telegram_id: telegramId })
      })
      const data = await res.json()
      if (data.success) {
        setApplied(true)
        tg?.HapticFeedback?.notificationOccurred('success')
      } else {
        setError(data.error || 'Ошибка при отклике')
      }
    } catch (err) {
      setError('Ошибка соединения')
    } finally {
      setApplying(false)
    }
  }

  const TYPE_LABELS: any = {
    full_time: 'Полная занятость',
    part_time: 'Частичная',
    gig: 'Подработка'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 font-black italic tracking-tighter text-blue-600 animate-pulse text-3xl">
      N84
    </div>
  )

  if (!vacancy) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-zinc-950">
      <h1 className="text-2xl font-black mb-4 tracking-tighter">ВАКАНСИЯ НЕ НАЙДЕНА</h1>
      <p className="opacity-50 font-bold mb-8 italic">Возможно, она уже закрыта или удалена.</p>
      <Link href="/board" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black">К ДОСКЕ ВАКАНСИЙ</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans pb-32">
      {/* Header */}
      <div className="bg-blue-600 p-8 pt-12 rounded-b-[3rem] text-white shadow-xl">
        <Link href="/board" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-all">
          <ArrowLeft size={14} /> Все вакансии
        </Link>
        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">{vacancy.title}</h1>
        {vacancy.employment_type && (
          <div className="flex items-center gap-2 opacity-80 text-xs font-black uppercase tracking-widest italic mt-2">
            <Clock size={12} />
            <span>{TYPE_LABELS[vacancy.employment_type] || vacancy.employment_type}</span>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 space-y-6">
        {/* Stats card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40">Зарплата</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg leading-none italic">
              <span className="font-black">₸</span> {vacancy.salary}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40">Район</p>
            <div className="flex items-center gap-2 font-bold text-lg leading-none italic">
              <MapPin size={18} /> {vacancy.area}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-zinc-800 space-y-6">
          {vacancy.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">О вакансии</h3>
              <p className="text-sm font-bold leading-relaxed opacity-70 whitespace-pre-line">{vacancy.description}</p>
            </div>
          )}
          {vacancy.requirements && (
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Требования</h3>
              <p className="text-sm font-bold leading-relaxed opacity-70 italic whitespace-pre-line">{vacancy.requirements}</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 font-bold text-sm text-center">
            {error}
          </div>
        )}

        {/* Apply button */}
        <div className="fixed bottom-8 left-6 right-6 max-w-md mx-auto">
          <button
            onClick={handleApply}
            disabled={applying || applied}
            className={`w-full ${applied ? 'bg-green-600 shadow-green-600/30' : 'bg-blue-600 shadow-blue-600/30'} text-white font-black py-5 rounded-3xl shadow-2xl flex items-center justify-center gap-3 text-lg uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all disabled:opacity-80`}
          >
            {applying ? <Loader2 className="animate-spin" /> : applied ? <><CheckCircle size={22} /> ОТКЛИК ОТПРАВЛЕН</> : <>ОТКЛИКНУТЬСЯ СЕЙЧАС <Send size={22} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
