'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    telegram: '',
    role: ''
  })

  // Загрузка пользователя и таймер
  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  // Таймер обратного отсчета для "Отправить еще раз"
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // POLLING: Проверка статуса верификации
  useEffect(() => {
    let interval: any;
    if (user && !user.is_verified) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id })
          })
          const data = await res.json()
          if (data.exists && data.profile.is_verified) {
            setUser(data.profile)
            localStorage.setItem('n84_user', JSON.stringify(data.profile))
            clearInterval(interval)
          }
        } catch (e) {
          console.error('Polling error', e)
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [user])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.role) return alert('Пожалуйста, выберите роль')
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
        setResendTimer(60) // Запускаем таймер
      } else {
        alert('Ошибка при регистрации: ' + data.error)
      }
    } catch (err) {
      console.error(err)
      alert('Произошла техническая ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20">N</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">N84</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm animate-incoming">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase relative">
                  {user.full_name?.[0] || 'U'}
                  {user.is_verified && (
                    <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 rounded-full">
                      <ShieldCheck size={14} className="text-blue-500" />
                    </div>
                  )}
                </div>
                <span className="font-bold text-sm tracking-tight">{user.full_name || 'User'}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero / Registration Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-fade-in">
              <Bot size={14} />
              <span>AI-Driven Platform for Youth</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              РАБОТА В <span className="text-blue-600 italic">АКТАУ</span> СТАЛА ПРОЩЕ
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Цифровая платформа занятости, объединяющая малый бизнес и молодежь Мангистау через ИИ. 
            </p>
          </div>

          <div className="flex-1 w-full max-w-md">
            {!user ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-2xl font-black mb-6 tracking-tighter">СОЗДАТЬ АККАУНТ</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Имя и Фамилия</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 opacity-30" size={18} />
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                        placeholder="Айбек Оразов"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Telegram Username</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-4 opacity-30" size={18} />
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                        placeholder="@username"
                        value={formData.telegram}
                        onChange={e => setFormData({...formData, telegram: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'employer'})}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'employer' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-600/10' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-50'}`}
                    >
                      <Briefcase size={20} className={formData.role === 'employer' ? 'text-blue-600' : ''} />
                      <span className="text-[10px] font-black uppercase">Бизнес</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'youth'})}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'youth' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-600/10' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-50'}`}
                    >
                      <Users size={20} className={formData.role === 'youth' ? 'text-blue-600' : ''} />
                      <span className="text-[10px] font-black uppercase">Молодежь</span>
                    </button>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>ЗАРЕГИСТРИРОВАТЬСЯ <Send size={16} /></>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl rotate-3 animate-in zoom-in-95 duration-500">
                <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">С возвращением!</h2>
                
                {!user.is_verified ? (
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl mb-8 border border-white/20">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Ожидаем подтверждения...</span>
                    </div>
                    
                    <a 
                      href={`https://t.me/SauraN84_bot?start=reg_${user.id}`} 
                      target="_blank"
                      className="block text-center bg-white text-blue-600 font-black py-4 rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
                    >
                      ПОДТВЕРДИТЬ В TG <ExternalLink size={18} />
                    </a>

                    <button 
                      disabled={resendTimer > 0}
                      onClick={() => {
                        window.open(`https://t.me/SauraN84_bot?start=reg_${user.id}`, '_blank');
                        setResendTimer(60);
                      }}
                      className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100 disabled:opacity-30 transition-all"
                    >
                      <RefreshCcw size={12} />
                      {resendTimer > 0 ? `ОТПРАВИТЬ ЕЩЕ РАЗ (${resendTimer}с)` : 'ОТПРАВИТЬ ЕЩЕ РАЗ'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl mb-8 border border-white/20 flex items-center gap-4 animate-in fade-in duration-1000">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Статус</p>
                      <p className="text-xl font-black tracking-tighter">ПОДТВЕРЖДЕНО ✅</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-4">
                  <Link 
                    href="/profile" 
                    className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform text-sm"
                  >
                    ЛИЧНЫЙ КАБИНЕТ <User size={18} />
                  </Link>
                  <Link 
                    href={user.role === 'employer' ? '/vacancies/new' : '/'} 
                    className="bg-blue-500/20 border border-white/30 text-white font-black px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-all border-dashed text-sm"
                  >
                    {user.role === 'employer' ? 'ОПУБЛИКОВАТЬ' : 'НАЙТИ РАБОТУ'} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-white dark:bg-zinc-900 py-20 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">200+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Студентов</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">50+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Компаний</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">AI</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Matching</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">24/7</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Поддержка</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-black italic">N</div>
            <span className="text-sm font-black uppercase italic">N84 Platform 2024</span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-40">
            Made for Hackathon Decentrathon 5.0
          </div>
        </div>
      </footer>
    </div>
  )
}
