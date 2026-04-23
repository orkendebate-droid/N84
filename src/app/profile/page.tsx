'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Calendar, Save, ArrowLeft, Bot, Sparkles, ShieldCheck, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    birthday: '',
    bio: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('n84_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      fetchProfile(user.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: null, id: id })
      })
      const data = await res.json()
      if (data.exists) {
        setProfile(data.profile)
        setFormData({
          full_name: data.profile.full_name || '',
          address: data.profile.address || '',
          birthday: data.profile.birthday || '',
          bio: data.profile.bio || ''
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id, ...formData })
      })
      const data = await res.json()
      if (data.success) {
        alert('Профиль успешно обновлен!')
      }
    } catch (err) {
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('ВНИМАНИЕ: Это действие нельзя отменить. Вы действительно хотите удалить свой аккаунт из N84?')) return
    
    setDeleting(true)
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.removeItem('n84_user')
        window.location.href = '/'
      }
    } catch (err) {
      alert('Ошибка при удалении')
      setDeleting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 font-black italic text-4xl animate-pulse text-blue-600">N84</div>

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center">
      <h1 className="text-4xl font-black mb-4 tracking-tighter">ВЫ НЕ ВОШЛИ</h1>
      <Link href="/" className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl">Вернуться на главную</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black italic text-xl">
            <ArrowLeft className="text-blue-600" />
            НАЗАД
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic text-xs">N</div>
            <span className="font-black tracking-tighter">ЛИЧНЫЙ КАБИНЕТ</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Info */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-blue-400/20">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Bot size={120} />
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black mb-6 border border-white/30 relative">
                {profile.full_name?.[0] || 'U'}
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <ShieldCheck className="text-blue-600" size={20} />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black leading-tight mb-2 tracking-tighter uppercase">{profile.full_name}</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest italic">
                  {profile.role === 'employer' ? 'Работодатель' : 'Молодежь'}
                </p>
                {profile.is_verified ? (
                  <span className="bg-white/20 text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest">Verified</span>
                ) : (
                  <span className="bg-red-500/20 text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest">Unverified</span>
                )}
              </div>
            </div>

            {!profile.is_verified && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border-2 border-dashed border-blue-600/30">
                <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Нужно подтверждение</p>
                <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl mb-4 text-center">
                  <div className="text-2xl font-black tracking-widest mb-1 italic">/verify {profile.verification_code}</div>
                </div>
                <p className="text-[10px] opacity-60 font-bold leading-tight">
                  Отправьте этот код нашему боту <a href="https://t.me/SauraN84_bot" target="_blank" className="text-blue-600 underline">@SauraN84_bot</a> для полной активации.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-blue-600 mb-4 font-black text-xs uppercase tracking-widest">
                <Sparkles size={14} />
                <span>AI СТАТУС</span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed font-bold">
                Заполните профиль на 100%, чтобы AI смог найти для вас лучшие предложения в Актау.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] p-6 border border-red-200 dark:border-red-900/30">
              <p className="text-[10px] font-black text-red-600 mb-4 uppercase tracking-widest">Опасная зона</p>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="animate-spin" /> : <><Trash2 size={18} /> УДАЛИТЬ АККАУНТ</>}
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Полное Имя</label>
                <div className="relative">
                  <User className="absolute left-6 top-5 opacity-30 text-blue-600" size={20} />
                  <input 
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-5 pl-16 rounded-[1.5rem] outline-none focus:ring-2 ring-blue-600 transition-all font-bold text-lg"
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Адрес / Микрорайон</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-5 opacity-30 text-blue-600" size={20} />
                  <input 
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-5 pl-16 rounded-[1.5rem] outline-none focus:ring-2 ring-blue-600 transition-all font-bold text-lg"
                    placeholder="14-й микрорайон, Актау"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Дата Рождения</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-5 opacity-30 text-blue-600" size={20} />
                  <input 
                    type="date"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-5 pl-16 rounded-[1.5rem] outline-none focus:ring-2 ring-blue-600 transition-all font-bold text-lg"
                    value={formData.birthday}
                    onChange={e => setFormData({...formData, birthday: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">О себе / Навыки</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-6 rounded-[1.5rem] outline-none focus:ring-2 ring-blue-600 transition-all font-bold text-lg resize-none"
                  placeholder="Расскажите о себе или вашем бизнесе..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={saving || deleting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 text-xl uppercase tracking-tighter disabled:opacity-50 font-bold"
              >
                {saving ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
                <Save />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
