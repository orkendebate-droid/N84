'use client'

import { useState, useEffect } from 'react'
import { MapPin, DollarSign, Briefcase, ChevronRight, Search, Sparkles, Filter, X, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

export default function JobBoardPage() {
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    area: '',
    industry: '',
    employment_type: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAllVacancies()
  }, [filters])

  const fetchAllVacancies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/vacancies/list-all?${params.toString()}`)
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

  const INDUSTRY_LABELS: any = {
    catering: 'Общепит',
    retail: 'Ритейл',
    services: 'Услуги',
    it: 'IT / Digital',
    delivery: 'Курьерская служба'
  }

  const TYPE_LABELS: any = {
    full_time: 'Полная занятость',
    part_time: 'Частичная',
    gig: 'Подработка'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-blue-600 p-8 pt-12 rounded-b-[3.5rem] text-white shadow-xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">ДОСКА РАБОТЫ</h1>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 italic mt-1">Актау • Мангистау</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl transition-all ${showFilters ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
          >
            {showFilters ? <X size={20} /> : <Filter size={20} />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 border border-white/10">
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 opacity-50" size={16} />
                <input 
                  className="w-full bg-white/10 border border-white/20 p-3 pl-12 rounded-xl outline-none placeholder:text-white/40 font-bold text-sm"
                  placeholder="Любой микрорайон..."
                  value={filters.area}
                  onChange={e => setFilters({...filters, area: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="bg-white/10 border border-white/20 p-3 rounded-xl outline-none font-bold text-xs"
                  value={filters.industry}
                  onChange={e => setFilters({...filters, industry: e.target.value})}
                >
                  <option value="" className="text-black">Все сферы</option>
                  <option value="catering" className="text-black">Общепит</option>
                  <option value="retail" className="text-black">Ритейл</option>
                  <option value="it" className="text-black">IT</option>
                </select>
                <select 
                  className="bg-white/10 border border-white/20 p-3 rounded-xl outline-none font-bold text-xs"
                  value={filters.employment_type}
                  onChange={e => setFilters({...filters, employment_type: e.target.value})}
                >
                  <option value="" className="text-black">Любой тип</option>
                  <option value="full_time" className="text-black">Полная</option>
                  <option value="part_time" className="text-black">Частичная</option>
                  <option value="gig" className="text-black">Подработка</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => setFilters({ area: '', industry: '', employment_type: '' })}
              className="w-full py-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-all text-center"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}
      </div>

      <main className="px-6 -mt-6 space-y-4">
        {loading ? (
          <div className="py-20 text-center font-black italic opacity-20 text-3xl animate-pulse">ИЩЕМ...</div>
        ) : vacancies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-xl border border-slate-200 dark:border-zinc-800">
            <p className="font-bold opacity-30 italic">По вашему запросу ничего не найдено. 😕</p>
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
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full uppercase italic">
                      <DollarSign size={10} />
                      {v.salary}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black opacity-50 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full uppercase italic">
                      <MapPin size={10} />
                      {v.area}
                    </div>
                    {v.employment_type && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full uppercase italic">
                        <Clock size={10} />
                        {TYPE_LABELS[v.employment_type] || v.employment_type}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-bold opacity-40 leading-tight line-clamp-2">
                    {v.description}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800 w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
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
