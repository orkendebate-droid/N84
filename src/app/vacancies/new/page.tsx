'use client'

import { useState, useEffect } from 'react'
import { Briefcase, MapPin, DollarSign, ListChecks, Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function NewVacancyPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    area: '',
    requirements: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return alert('Вы не вошли в систему')
    
    setLoading(true)
    try {
      const res = await fetch('/api/vacancies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, employer_id: user.id })
      })
      const data = await res.json()
      if (data.success) {
        alert('Вакансия опубликована! Бот начал рассылку подходящей молодежи. 🚀')
        window.location.href = '/profile'
      }
    } catch (err) {
      alert('Ошибка при публикации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 font-black italic text-sm mb-8 opacity-50 hover:opacity-100 transition-all">
          <ArrowLeft size={16} /> НАЗАД
        </Link>
        
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">НОВАЯ ВАКАНСИЯ</h1>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Опубликовать в N84 Актау</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Название должности</label>
              <input 
                required
                className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                placeholder="Например: Бариста, Курьер, Промоутер"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Район (мкр)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4.5 opacity-30 text-blue-600" size={18} />
                  <input 
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 pl-12 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                    placeholder="14 мкр"
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Зарплата</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-4.5 opacity-30 text-blue-600" size={18} />
                  <input 
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 pl-12 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                    placeholder="150,000 ₸"
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Описание работы</label>
              <textarea 
                rows={4}
                className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-6 rounded-2xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold resize-none"
                placeholder="Расскажите подробнее о задачах..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Требования</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-6 rounded-2xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold resize-none"
                placeholder="Например: ответственность, пунктуальность..."
                value={formData.requirements}
                onChange={e => setFormData({...formData, requirements: e.target.value})}
              />
            </div>

            <div className="bg-blue-600/5 dark:bg-blue-600/10 p-5 rounded-2xl border border-blue-600/10 flex items-start gap-3">
              <Sparkles className="text-blue-600 shrink-0" size={20} />
              <p className="text-[10px] font-bold leading-relaxed opacity-60">
                После публикации наш ИИ проанализирует базу молодежи и отправит уведомления в Телеграм тем, кто живет рядом или обладает нужными навыками.
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 text-xl uppercase tracking-tighter disabled:opacity-50 font-bold"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>ОПУБЛИКОВАТЬ ВАКАНСИЮ <Send size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
