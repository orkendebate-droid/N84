'use client'

import { useState, useEffect } from 'react'
import { MapPin, DollarSign, Briefcase, ChevronRight, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function JobBoardPage() {
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllVacancies()
  }, [])

  const fetchAllVacancies = async () => {
    try {
      const res = await fetch('/api/vacancies/list-all')
      const data = await res.json()
      if (data.success) {
        setVacancies(data.vacancies)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 font-black italic tracking-tighter text-blue-600 animate-pulse">N84 BOARD...</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-blue-600 p-8 pt-12 rounded-b-[3rem] text-white shadow-xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">ДОСКА РАБОТЫ</h1>
          <div className="bg-white/20 p-2 rounded-xl">
            <Sparkles size={20} />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 italic">Все вакансии Актау для молодежи</p>
      </div>

      <main className="px-6 -mt-6 space-y-4">
        {vacancies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-xl border border-slate-200 dark:border-zinc-800">
            <p className="font-bold opacity-30 italic">Пока нет активных вакансий. Заходи позже! 👋</p>
          </div>
        ) : (
          vacancies.map(v => (
            <Link 
              key={v.id} 
              href={`/vacancy/${v.id}`}
              className="block bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-zinc-800 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <h2 className="text-xl font-black tracking-tighter uppercase leading-none group-hover:text-blue-600 transition-colors uppercase italic">{v.title}</h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full italic">
                      <DollarSign size={12} />
                      {v.salary}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold opacity-50 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full italic">
                      <MapPin size={12} />
                      {v.area}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold opacity-40 leading-tight line-clamp-2">
                    {v.description}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800 w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  )
}
