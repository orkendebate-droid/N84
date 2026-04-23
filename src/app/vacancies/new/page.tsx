'use client'

import { useState } from 'react'
import { MapPin, Briefcase, DollarSign, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createVacancyAndNotify } from '@/app/actions/vacancies'

export default function NewVacancyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Кафе',
    district: '',
    salary: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await createVacancyAndNotify(formData)
      if (result.success) {
        alert(`Вакансия опубликована! Мы уведомили ${result.notifiedCount} подходящих ребят.`)
        router.push('/')
      } else {
        alert('Ошибка при публикации')
      }
    } catch (error) {
      console.error(error)
      alert('Ошибка при создании вакансии')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-6">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-zinc-800">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-black tracking-tight">Новое объявление</h1>
          <p className="opacity-60 font-medium">Расскажите, кого вы ищете, и наш AI подберет лучших кандидатов.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider opacity-60">Название вакансии</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 opacity-40" />
              <input 
                required
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                placeholder="Например: Бариста, Официант..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider opacity-60">Микрорайон Актау</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 opacity-40" />
                <input 
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                  placeholder="Например: 14 мкр"
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider opacity-60">Оплата (в месяц)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-4 opacity-40" />
                <input 
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                  placeholder="Например: 200 000 ₸"
                  value={formData.salary}
                  onChange={e => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider opacity-60">Описание и требования</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
              placeholder="Опишите задачи и кого вы ищете (AI учтет это при рассылке ребята)"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Публикуем...' : (
              <>
                <Send size={20} />
                Опубликовать и оповестить ребят
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
