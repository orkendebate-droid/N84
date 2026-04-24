'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw, LogIn, ChevronRight, MessageSquare } from "lucide-react";
import Link from 'next/link'
import TelegramLogin from '@/components/TelegramLogin'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'employer' | 'youth'>('youth')

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  const handleTelegramAuth = async (tgUser: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/tg-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tgUser, role: selectedRole })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
      }
    } catch (err) {
      alert('Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform">N</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">N84</span>
          </Link>
          
          {user && (
            <Link href="/profile" className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm hover:border-blue-600 transition-all group">
              <span className="font-bold text-sm tracking-tight">{user.full_name}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase">{user.full_name?.[0]}</div>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Bot size={14} />
              <span>Hackathon Project - Aktau 2024</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
              ТВОЯ <span className="text-blue-600 not-italic">КАРЬЕРА</span><br/> НАЧИНАЕТСЯ ЗДЕСЬ
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed font-medium">
              Первая интеллектуальная платформа Актау, которая находит работу молодежи через AI и Telegram. 
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm font-bold text-sm">
                <ShieldCheck className="text-blue-600" size={18} /> Verified by TG
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm font-bold text-sm">
                <MessageSquare className="text-blue-600" size={18} /> Direct Bot Access
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="flex-1 w-full max-w-md">
            {!user ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-zinc-800 relative">
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl rotate-12 shadow-lg">JOIN N84</div>
                
                <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase text-center italic">Присоединиться</h2>
                
                <div className="space-y-8">
                  {/* Step 1: Role Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSelectedRole('employer')}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'employer' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-40'}`}
                    >
                      <Briefcase size={20} className={selectedRole === 'employer' ? 'text-blue-600' : ''} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Работодатель</span>
                    </button>
                    <button 
                      onClick={() => setSelectedRole('youth')}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'youth' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-40'}`}
                    >
                      <Users size={20} className={selectedRole === 'youth' ? 'text-blue-600' : ''} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Школьник / Студент</span>
                    </button>
                  </div>

                  {/* Highlight for Youth */}
                  {selectedRole === 'youth' && (
                    <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 space-y-4">
                       <p className="text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2">
                         <Bot size={16} /> РЕКОМЕНДУЕМЫЙ СПОСОБ
                       </p>
                       <p className="text-[11px] font-bold leading-tight opacity-90">
                         Если ты пришел из TikTok или соцсетей, удобнее всего зарегистрироваться прямо в Телеграме. Просто нажми на ссылку:
                       </p>
                       <a 
                         href="https://t.me/SauraN84_bot" 
                         target="_blank"
                         className="w-full bg-white text-blue-600 font-black py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-tighter hover:scale-105 transition-all"
                       >
                         ОТКРЫТЬ @SauraN84_bot <Send size={14} />
                       </a>
                    </div>
                  )}

                  {/* Standard Way */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-black opacity-60 mb-6 uppercase tracking-widest leading-none">Вход через браузер</p>
                    <TelegramLogin botUsername="SauraN84_bot" onAuth={handleTelegramAuth} />
                    <p className="text-[10px] opacity-40 mt-4 font-bold leading-tight uppercase italic underline underline-offset-4">
                       Для управления профилем
                    </p>
                  </div>

                  {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-[3rem] flex items-center justify-center z-10">
                      <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl font-black border border-white/30 rotate-6 shadow-xl">
                  {user.full_name?.[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Привет, {user.first_name || 'друг'}!</h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Ты успешно авторизован</p>
                </div>
                
                <div className="w-full space-y-3">
                  <Link 
                    href="/profile" 
                    className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-xl text-sm uppercase tracking-tighter"
                  >
                    ЛИЧНЫЙ КАБИНЕТ <User size={18} />
                  </Link>
                  <button 
                    onClick={() => { localStorage.removeItem('n84_user'); window.location.reload(); }}
                    className="w-full py-4 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Trust Section */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
        <div className="text-xs font-black uppercase tracking-widest leading-none">N84 Aktau Platform © 2024</div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
           <span>Supabase Power</span>
           <span>Qwen AI Integrated</span>
           <span>Custom Bot Logic</span>
        </div>
      </footer>
    </div>
  )
}
