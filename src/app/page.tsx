'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw, LogIn, ChevronRight, MessageSquare, KeyRound, Building2 } from "lucide-react";
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'employer' | 'youth'>('youth')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  
  const [formData, setFormData] = useState({
    username: '',
    code: '',
    full_name: '',
    company_name: '',
    bin_iin: '',
    industry: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const endpoint = mode === 'login' ? '/api/auth/otp-login' : '/api/auth/register-employer'
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: selectedRole })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Ошибка соединения')
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

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center space-y-8 mb-12 px-4">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse mx-auto">
              <Bot size={14} />
              <span>Hackathon Project - Aktau 2024</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
              ТВОЯ <span className="text-blue-600 not-italic">КАРЬЕРА</span><br/> НАЧИНАЕТСЯ ЗДЕСЬ
            </h1>
        </div>

        <div className="w-full max-w-md">
            {!user ? (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-zinc-800 relative">
                    <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl rotate-12 shadow-lg">JOIN N84</div>
                    
                    <div className="flex gap-4 mb-8">
                        <button 
                            onClick={() => { setSelectedRole('youth'); setMode('login'); }}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all ${selectedRole === 'youth' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-zinc-800 opacity-40'}`}
                        >
                            Молодежь
                        </button>
                        <button 
                            onClick={() => setSelectedRole('employer')}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all ${selectedRole === 'employer' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-zinc-800 opacity-40'}`}
                        >
                            Работодатель
                        </button>
                    </div>

                    {selectedRole === 'employer' && (
                        <div className="flex bg-slate-50 dark:bg-zinc-800 p-1.5 rounded-2xl mb-8">
                            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'login' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>Вход</button>
                            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'register' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>Регистрация</button>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {selectedRole === 'youth' ? (
                            <div className="bg-blue-600 text-white p-8 rounded-[2rem] text-center space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase opacity-60">Только через бот</p>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">@SauraN84_bot</h3>
                                </div>
                                <p className="text-[11px] font-bold opacity-80 leading-relaxed">Школьники и студенты регистрируются в боте. Это быстрее и удобнее!</p>
                                <a href="https://t.me/SauraN84_bot" target="_blank" className="block w-full bg-white text-blue-600 font-black py-4 rounded-xl text-sm uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all">Открыть бота <Send size={18} className="inline ml-1" /></a>
                                <div className="pt-4 border-t border-white/10">
                                   <p className="text-[9px] font-black uppercase opacity-40 mb-3 tracking-widest">Уже есть анкета? Войди в кабинет:</p>
                                   <div className="space-y-3">
                                       <input className="w-full bg-white/10 border-none p-4 rounded-xl text-xs font-bold placeholder:text-white/40" placeholder="Username (без @)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                       <div className="flex gap-2">
                                          <input className="flex-1 bg-white/10 border-none p-4 rounded-xl text-xs font-black text-center tracking-[.5em]" placeholder="КOД" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                          <button type="submit" className="bg-white text-blue-600 px-6 rounded-xl font-black"><ChevronRight size={20} /></button>
                                       </div>
                                   </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {mode === 'register' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl text-sm font-bold border-none" placeholder="ФИО / Ответственное лицо" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl text-sm font-bold border-none" placeholder="Название вашей компании" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl text-sm font-bold border-none" placeholder="БИН / ИИН" value={formData.bin_iin} onChange={e => setFormData({...formData, bin_iin: e.target.value})} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="flex items-center bg-slate-50 dark:bg-zinc-800 rounded-xl px-4">
                                        <AtSign size={16} className="text-blue-600 opacity-40" />
                                        <input className="flex-1 bg-transparent p-4 rounded-xl text-sm font-bold border-none outline-none" placeholder="Telegram ник (без @)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-600/10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-600 uppercase">Секретный код</p>
                                            <p className="text-[9px] font-bold opacity-40 leading-none">Напиши /login боту @SauraN84_bot</p>
                                        </div>
                                        <input className="w-20 bg-white dark:bg-zinc-700 p-2 rounded-lg text-center font-black tracking-widest border-none outline-none" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 text-sm uppercase tracking-tighter flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-4">
                                    {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'ВОЙТИ В КАБИНЕТ' : 'ЗАРЕГИСТРИРОВАТЬ КОМПАНИЮ'} <LogIn size={18} /></>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <div className="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl font-black border border-white/30 rotate-6 shadow-xl leading-none">
                        {user.full_name?.[0]}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Привет, {user.full_name?.split(' ')[0]}!</h2>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Успешная авторизация</p>
                    </div>
                    <div className="w-full space-y-3">
                        <Link href="/profile" className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-xl text-sm uppercase tracking-tighter">ПЕРЕЙТИ В КАБИНЕТ <ChevronRight size={18} /></Link>
                        <button onClick={() => { localStorage.removeItem('n84_user'); window.location.reload(); }} className="w-full py-4 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest">Выйти из системы</button>
                    </div>
                </div>
            )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-zinc-800 opacity-30 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
         <span>N84 Aktau Platform</span>
         <div className="flex gap-6 italic">
            <span>Only Youth via Bot</span>
            <span>Only Business via Site</span>
         </div>
      </footer>
    </div>
  )
}
