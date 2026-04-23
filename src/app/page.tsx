'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw, LogIn } from "lucide-react";
import Link from 'next/link'
import TelegramLogin from '@/components/TelegramLogin'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', telegram: '', role: '' })

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  // Обработка входа через виджет
  const handleTelegramAuth = async (tgUser: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/tg-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser)
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
      }
    } catch (err) {
      alert('Ошибка при входе через Telegram')
    } finally {
      setLoading(false)
    }
  }

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
      }
    } catch (err) { alert('Ошибка регистрации') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">N</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">N84</span>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
              <span className="font-bold text-sm tracking-tight">{user.full_name}</span>
              {user.is_verified && <ShieldCheck size={16} className="text-blue-500" />}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
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
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800">
                <h2 className="text-2xl font-black mb-8 tracking-tighter uppercase text-center">ПРИСОЕДИНИТЬСЯ</h2>
                
                {/* Telegram Login Section */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-blue-100 dark:border-zinc-700 text-center">
                    <p className="text-sm font-bold opacity-60 mb-4 uppercase tracking-widest">Самый быстрый способ</p>
                    <TelegramLogin 
                      botUsername="SauraN84_bot" 
                      onAuth={handleTelegramAuth} 
                    />
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                    <span className="flex-shrink mx-4 text-xs font-black uppercase opacity-20">ИЛИ ВРУЧНУЮ</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                  </div>

                  {/* Manual Form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                      placeholder="Ваше Имя"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none p-4 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all font-bold"
                      placeholder="@telegram_username"
                      value={formData.telegram}
                      onChange={e => setFormData({...formData, telegram: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'employer'})}
                        className={`p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${formData.role === 'employer' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800'}`}
                      >
                        Я Работодатель
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'youth'})}
                        className={`p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${formData.role === 'youth' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800'}`}
                      >
                        Я Ищу Работу
                      </button>
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'СОЗДАТЬ АККАУНТ'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl rotate-3 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase">С возвращением!</h2>
                <div className="flex flex-col gap-3">
                  <Link 
                    href="/profile" 
                    className="bg-white text-blue-600 font-black px-8 py-5 rounded-2xl inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    ЛИЧНЫЙ КАБИНЕТ <User size={20} />
                  </Link>
                  <button 
                    onClick={() => { localStorage.removeItem('n84_user'); window.location.reload(); }}
                    className="text-white/60 font-bold text-xs uppercase hover:text-white transition-colors py-2"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="bg-white dark:bg-zinc-900 py-20 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-blue-600 font-black">
          <div><div className="text-4xl">200+</div><div className="text-[10px] opacity-40">Студентов</div></div>
          <div><div className="text-4xl">50+</div><div className="text-[10px] opacity-40">Компаний</div></div>
          <div><div className="text-4xl">AI</div><div className="text-[10px] opacity-40">Matching</div></div>
          <div><div className="text-4xl">24/7</div><div className="text-[10px] opacity-40">Поддержка</div></div>
        </div>
      </section>
    </div>
  )
}
