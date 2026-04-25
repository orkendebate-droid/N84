'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Calendar, Save, ArrowLeft, Bot, Sparkles, ShieldCheck, Trash2, Loader2, Plus, Briefcase, ChevronRight, MessageCircle, Check, X } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [vacancies, setVacancies] = useState<any[]>([])
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({ 
    full_name: '', 
    address: '', 
    bio: '',
    company_name: '',
    bin_iin: '',
    industry: '',
    link: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('n84_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      fetchProfile(user.id)
    } else { setLoading(false) }
  }, [])

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.exists) {
        setProfile(data.profile)
        setFormData({
          full_name: data.profile.full_name || '',
          address: data.profile.address || '',
          bio: data.profile.bio || '',
          company_name: data.profile.company_name || '',
          bin_iin: data.profile.bin_iin || '',
          industry: data.profile.industry || '',
          link: data.profile.link || ''
        })
        if (data.profile.role === 'employer') {
          fetchMyVacancies(id)
          fetchApplications(id)
        }
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const fetchMyVacancies = async (employerId: string) => {
    try {
      const res = await fetch(`/api/vacancies/list?employer_id=${employerId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) setVacancies(data.vacancies)
      }
    } catch (err) { console.error(err) }
  }

  const fetchApplications = async (employerId: string) => {
    try {
      const res = await fetch(`/api/applications/list-for-employer?employer_id=${employerId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) setApps(data.applications)
      }
    } catch (err) { console.error(err) }
  }

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status })
      })
      if (res.ok) {
        setApps(apps.map(app => app.id === appId ? { ...app, status } : app))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const currentId = profile?.id || JSON.parse(localStorage.getItem('n84_user') || '{}').id
      
      if (!currentId) {
        alert('Ошибка: сессия истекла. Пожалуйста, войдите снова.')
        return
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentId, 
          ...formData,
          user_age: (formData as any).user_age || (formData as any).birthday || ''
        })
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
        alert('Успешно сохранено! ✨')
      } else {
        alert('Сервер вернул ошибку: ' + data.error)
      }
    } catch (err) { 
      console.error(err)
      alert('Ошибка сети или сервера. Проверьте интернет.') 
    } finally { 
      setSaving(false) 
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить аккаунт навсегда?')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id })
      })
      if ((await res.json()).success) { localStorage.removeItem('n84_user'); window.location.href = '/' }
    } catch (err) { alert('Ошибка'); setDeleting(false) }
  }

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return
    console.log('[DELETE] Attempting to delete vacancy:', id);
    try {
      const res = await fetch('/api/vacancies/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      console.log('[DELETE] Server response:', data);
      if (data.success) {
        setVacancies(vacancies.filter(v => v.id !== id))
      } else {
        alert('Ошибка сервера: ' + data.error)
      }
    } catch (err) {
      console.error('[DELETE] Fetch error:', err);
      alert('Ошибка при удалении. Проверьте консоль.')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 font-black italic text-4xl animate-pulse text-blue-600">N84</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans pb-20">
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black italic text-xl">
            <ArrowLeft className="text-blue-600" /> НАЗАД
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic text-xs">N</div>
            <span className="font-black tracking-tighter">ЛИЧНЫЙ КАБИНЕТ</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black mb-6 border border-white/30 relative">
                {profile?.full_name?.[0] || 'U'}
                {profile?.is_verified && <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1"><ShieldCheck className="text-blue-600" size={20} /></div>}
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">{profile?.full_name}</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest italic">{profile?.role === 'employer' ? 'Работодатель / Бизнес' : 'Молодежь'}</p>
            </div>

            {profile?.role === 'employer' && (
              <Link href="/vacancies/new" className="block w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black py-6 rounded-[2rem] text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> НОВАЯ ВАКАНСИЯ
              </Link>
            )}

            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-[2.5rem] p-6 border border-red-200 dark:border-red-900/30">
              <button onClick={handleDelete} disabled={deleting} className="w-full text-red-600 font-black py-4 flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all text-sm uppercase">
                <Trash2 size={16} /> Удалить профиль
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 space-y-8">
            {profile?.role === 'youth' && (
              <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-zinc-800 shadow-xl mb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles size={160} />
                </div>
                <Sparkles size={48} className="text-blue-600 mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Найти Мечту</h3>
                <p className="font-medium opacity-60 mb-8 max-w-sm">Используйте нашу доску, чтобы откликаться на лучшие предложения города, или заполните профиль, чтобы работодатели вас заметили.</p>
                <Link href="/board" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:scale-105 transition-all w-full md:w-auto">
                  Смотреть Вакансии
                </Link>
              </div>
            )}

            {profile?.role === 'employer' && (
              <>
                {/* Applications Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <MessageCircle size={120} />
                   </div>
                   <div className="flex items-center justify-between mb-8 relative">
                      <h3 className="text-xl font-black uppercase tracking-tighter">Отклики Кандидатов</h3>
                      <span className="bg-green-100 dark:bg-green-900/20 text-green-600 px-4 py-1 rounded-full text-[10px] font-black">{apps.length} НОВЫХ</span>
                   </div>

                   {apps.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[2rem]">
                      <p className="text-sm font-bold opacity-30 italic">Пока никто не откликнулся.</p>
                    </div>
                   ) : (
                    <div className="space-y-4 relative">
                      {apps.map(app => (
                        <div key={app.id} className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-transparent hover:border-blue-600/10 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg leading-none uppercase italic">{app.youth.full_name}</h4>
                                {app.youth.username && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">@{app.youth.username}</span>
                                )}
                                <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{app.vacancy.title}</span>
                                
                                {/* AI SCORE BADGE */}
                                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 animate-pulse">
                                  <Sparkles size={10} />
                                  <span className="text-[9px] font-black uppercase tracking-tighter">AI MATCH: {app.match_score || 8}/10</span>
                                </div>
                              </div>
                              <p className="text-[10px] font-bold opacity-50 leading-tight"><MapPin size={10} className="inline mr-1" /> {app.youth.address}</p>
                              <p className="text-xs font-medium opacity-70 line-clamp-2 italic">"{app.youth.bio}"</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 min-w-[120px]">
                              {app.status === 'accepted' ? (
                                <div className="bg-green-100 text-green-600 p-2 rounded-lg text-center text-[10px] font-black uppercase">ПРИНЯТ</div>
                              ) : app.status === 'rejected' ? (
                                <div className="bg-red-100 text-red-600 p-2 rounded-lg text-center text-[10px] font-black uppercase">ОТКАЗ</div>
                              ) : (
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex-1 bg-green-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-center">
                                    <Check size={24} strokeWidth={3} />
                                  </button>
                                  <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 bg-slate-300 text-slate-600 p-3 rounded-xl shadow-lg flex items-center justify-center">
                                    <X size={24} strokeWidth={3} />
                                  </button>
                                </div>
                              )}
                              <a 
                                href={`https://t.me/${app.youth.username || app.youth.telegram_id}`} 
                                target="_blank"
                                className="bg-blue-600 text-white p-3 rounded-xl shadow-lg text-[10px] font-black uppercase flex justify-center items-center gap-2"
                              >
                                <MessageCircle size={14} /> ЧАТ
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                   )}
                </div>

                {/* Vacancies Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-zinc-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Мои Вакансии</h3>
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black">{vacancies.length} АКТИВНЫХ</span>
                  </div>
                  
                  {vacancies.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[2rem]">
                      <p className="text-sm font-bold opacity-30 italic">У вас пока нет опубликованных вакансий.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vacancies.map(v => (
                        <div key={v.id} className="group bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-600/20 transition-all">
                          <div>
                            <h4 className="font-black text-lg leading-none mb-1 uppercase italic tracking-tighter">{v.title}</h4>
                            <p className="text-xs font-bold opacity-40">{v.area} • {v.salary} ₸</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteVacancy(v.id)}
                              className="w-10 h-10 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                            <Link href={`/vacancy/${v.id}`} className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <ChevronRight size={20} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Profile Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-zinc-800 shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                 <User className="text-blue-600" size={24} /> 
                 {profile?.role === 'employer' ? 'Настройки Бизнеса' : 'Моя Анкета'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-8">
                {profile?.role === 'employer' ? (
                  /* РЕНДЕР ТОЛЬКО ДЛЯ РАБОТОДАТЕЛЯ */
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-600/5">
                        <div className="col-span-full mb-2 flex items-center gap-2">
                           <Briefcase size={16} className="text-blue-600" />
                           <span className="text-[10px] font-black uppercase italic tracking-widest opacity-60">Информация о компании</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Название Компании</label>
                          <input className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold focus:ring-2 ring-blue-600/20 transition-all" placeholder="ИП 'Актау Сити'" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">БИН / ИИН</label>
                          <input className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold focus:ring-2 ring-blue-600/20 transition-all" placeholder="12 цифр" value={formData.bin_iin} onChange={e => setFormData({...formData, bin_iin: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Сфера</label>
                          <select className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold appearance-none" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                            <option value="">Выбрать...</option>
                            <option value="catering">Общепит / Кафе</option>
                            <option value="retail">Ритейл / Магазины</option>
                            <option value="services">Услуги / Сервис</option>
                            <option value="it">IT / Digital</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Instagram / Сайт</label>
                          <input className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold focus:ring-2 ring-blue-600/20 transition-all" placeholder="@company_aktau" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2 text-blue-600">Контактное лицо</label>
                        <input className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 rounded-xl font-bold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2 text-blue-600">Адрес офиса</label>
                        <input className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 rounded-xl font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="col-span-full space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2 text-blue-600">О компании</label>
                        <textarea rows={3} className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 rounded-xl font-bold resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* РЕНДЕР ТОЛЬКО ДЛЯ МОЛОДЕЖИ - НИКАКИХ БИН И КОМПАНИЙ */
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-zinc-800/30 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-zinc-800">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2">Ваше Имя</label>
                        <input className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2 text-blue-600">Район проживания</label>
                        <input className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold" placeholder="Пример: 14 мкр" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2 text-blue-600">Дата рождения</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute right-4 top-4 opacity-20" />
                          <input 
                            className="w-full bg-white dark:bg-zinc-800 border-none p-4 rounded-xl font-bold" 
                            placeholder="ДД.ММ.ГГГГ" 
                            value={(formData as any).user_age || (formData as any).birthday || ''} 
                            onChange={e => setFormData({...formData, user_age: e.target.value} as any)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 px-4">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-2">О себе и навыках</label>
                      <textarea rows={5} className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-5 rounded-[1.5rem] font-bold resize-none" placeholder="Напишите, что вы умеете (например: бариста, умею работать в Excel, вежливо общаюсь с людьми)..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/30 uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] transition-all active:scale-95 mt-4">
                  {saving ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'} <Save size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
