'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw, LogIn, ChevronRight, MessageSquare, KeyRound, Building2, Sparkles, TrendingUp, Globe } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-400 blur-[100px] delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform">N</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">N84</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest opacity-60">
             <Link href="/board" className="hover:text-blue-600 transition-colors">Вакансии</Link>
             <a href="https://t.me/SauraN84_bot" target="_blank" className="hover:text-blue-600 transition-colors">Telegram</a>
             <Link href="/about" className="hover:text-blue-600 transition-colors">О проекте</Link>
          </div>

          {user && (
            <Link href="/profile" className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm hover:border-blue-600 transition-all group">
              <span className="font-bold text-sm tracking-tight">{user.full_name}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase">{user.full_name?.[0]}</div>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
          
          {/* Left Side: Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-fade-in">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>AI-платформа №1 в Мангистау</span>
            </div>
            
            <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic">
                  ТВОЯ <span className="text-blue-600 not-italic">КАРЬЕРА</span><br/> НАЧИНАЕТСЯ ЗДЕСЬ
                </h1>
                <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
                  Мы соединяем амбициозную молодежь Актау с лучшими работодателями через умные алгоритмы Qwen AI и Telegram. 🌊🚀
                </p>
            </div>

            {/* Desktop-only Stats */}
            <div className="hidden md:grid grid-cols-3 gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-2xl font-black text-blue-600">500+</p>
                <p className="text-[10px] font-black uppercase opacity-40">Студентов</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-blue-600">120+</p>
                <p className="text-[10px] font-black uppercase opacity-40">Компаний</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-blue-600">Актау</p>
                <p className="text-[10px] font-black uppercase opacity-40">Локация</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase opacity-50">
                   <TrendingUp size={14} /> Рост карьеры
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase opacity-50">
                   <Globe size={14} /> Весь Актау
                </div>
            </div>
          </div>

          {/* Right Side: Auth Card */}
          <div className="w-full lg:w-[480px] shrink-0 animate-in slide-in-from-right-8 duration-700">
            {!user ? (
                <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/10 transition-all"></div>
                    
                    <div className="flex gap-4 mb-8 relative">
                        <button 
                            onClick={() => { setSelectedRole('youth'); setMode('login'); }}
                            className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all flex flex-col items-center gap-2 ${selectedRole === 'youth' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50 dark:bg-zinc-800 opacity-40 hover:opacity-60'}`}
                        >
                            <Users size={20} />
                            Молодежь
                        </button>
                        <button 
                            onClick={() => setSelectedRole('employer')}
                            className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all flex flex-col items-center gap-2 ${selectedRole === 'employer' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50 dark:bg-zinc-800 opacity-40 hover:opacity-60'}`}
                        >
                            <Briefcase size={20} />
                            Работодатель
                        </button>
                    </div>

                    {selectedRole === 'employer' && (
                        <div className="flex bg-slate-50 dark:bg-zinc-800 p-1.5 rounded-[1.5rem] mb-8 relative">
                            <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'login' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>Вход</button>
                            <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'register' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-40'}`}>Регистрация</button>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5 relative">
                        {selectedRole === 'youth' ? (
                            <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] text-center space-y-8 animate-in slide-in-from-bottom-4 shadow-2xl shadow-blue-600/30">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Exclusive Bot Path</p>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">@SAURAN84_BOT</h3>
                                </div>
                                <p className="text-[11px] font-bold opacity-80 leading-relaxed italic">Регистрация соискателей проходит исключительно в Телеграм. Это гарантирует 100% доставку уведомлений.</p>
                                <a href="https://t.me/SauraN84_bot" target="_blank" className="block w-full bg-white text-blue-600 font-black py-5 rounded-2xl text-sm uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl">ОТКРЫТЬ БОТА <Send size={18} className="inline ml-2" /></a>
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                   <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Уже есть профиль?</p>
                                   <div className="space-y-3">
                                       <div className="relative">
                                          <AtSign className="absolute left-4 top-3.5 opacity-30" size={16} />
                                          <input className="w-full bg-white/10 border-none p-4 pl-12 rounded-2xl text-xs font-bold placeholder:text-white/40 outline-none focus:bg-white/20 transition-all" placeholder="Username (без @)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                       </div>
                                       <div className="flex gap-2">
                                          <input className="flex-1 bg-white/10 border-none p-4 rounded-2xl text-xs font-black text-center tracking-[.8em] outline-none focus:bg-white/20 transition-all" placeholder="КOД" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                          <button type="submit" className="bg-white text-blue-600 px-8 rounded-2xl font-black shadow-lg hover:scale-[1.05] active:scale-95 transition-all"><ChevronRight size={24} /></button>
                                       </div>
                                   </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {mode === 'register' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20 transition-all" placeholder="ФИО Ответственного" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20 transition-all" placeholder="Название компании" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                                            <input className="bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20 transition-all" placeholder="БИН 12 цифр" value={formData.bin_iin} onChange={e => setFormData({...formData, bin_iin: e.target.value})} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="flex items-center bg-slate-50 dark:bg-zinc-800 rounded-2xl px-5 border border-transparent focus-within:border-blue-600/20 transition-all">
                                        <AtSign size={18} className="text-blue-600 opacity-40" />
                                        <input className="flex-1 bg-transparent p-5 rounded-2xl text-sm font-bold border-none outline-none" placeholder="Telegram ник" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                    </div>
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-600/10 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Код доступа</p>
                                            <p className="text-[9px] font-bold opacity-40 leading-none">Команда /login в @SauraN84_bot</p>
                                        </div>
                                        <input className="w-24 bg-white dark:bg-zinc-700 p-3 rounded-xl text-center font-black text-xl tracking-widest border-none outline-none shadow-sm" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black py-6 rounded-[2rem] shadow-2xl text-sm uppercase tracking-tighter flex justify-center items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6 group">
                                    {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'ВОЙТИ В КАБИНЕТ' : 'СОЗДАТЬ АККАУНТ'} <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <div className="bg-blue-600 p-12 lg:p-16 rounded-[4rem] text-white shadow-2xl flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-5xl font-black border border-white/30 rotate-6 shadow-2xl leading-none relative">
                        {user.full_name?.[0]}
                    </div>
                    <div className="space-y-2 relative">
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none italic">Салем, {user.full_name?.split(' ')[0]}!</h2>
                        <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">Your Dashboard is ready</p>
                    </div>
                    <div className="w-full space-y-4 relative">
                        <Link href="/profile" className="w-full bg-white text-blue-600 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.03] transition-all shadow-2xl text-sm uppercase tracking-tighter">ПЕРЕЙТИ К УПРАВЛЕНИЮ <ChevronRight size={20} /></Link>
                        <button onClick={() => { localStorage.removeItem('n84_user'); window.location.reload(); }} className="w-full py-2 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest">Выйти из системы</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-200 dark:border-zinc-800 opacity-30 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>N84 Aktau High-Tech Platform © 2024</span>
         </div>
         <div className="flex gap-10 italic">
            <span>Powered by Qwen AI</span>
            <span>GrammY Bot Core</span>
            <span>Supabase Database</span>
         </div>
      </footer>
    </div>
  )
}
