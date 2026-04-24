'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight, User, AtSign, Send, ShieldCheck, ExternalLink, Loader2, RefreshCcw, LogIn, ChevronRight, MessageSquare, KeyRound } from "lucide-react";
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'employer' | 'youth'>('youth')
  
  const [tgUsername, setTgUsername] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: tgUsername, 
          code: otpCode, 
          role: selectedRole 
        })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.profile)
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
      } else {
        alert(data.error)
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

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center space-y-8 mb-16 px-4">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse mx-auto">
              <Bot size={14} />
              <span>Hackathon Project - Aktau 2024</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
              ТВОЯ <span className="text-blue-600 not-italic">КАРЬЕРА</span><br/> НАЧИНАЕТСЯ В ТГ
            </h1>
        </div>

        <div className="w-full max-w-md">
            {!user ? (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl rotate-12 shadow-lg">JOIN N84</div>
                    
                    <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase text-center italic">Вход в систему</h2>
                    
                    <div className="space-y-8">
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { setSelectedRole('employer'); setShowOtp(false); }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'employer' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-40'}`}
                            >
                                <Briefcase size={20} className={selectedRole === 'employer' ? 'text-blue-600' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Работодатель</span>
                            </button>
                            <button 
                                onClick={() => { setSelectedRole('youth'); setShowOtp(false); }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'youth' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-zinc-800 opacity-40'}`}
                            >
                                <Users size={20} className={selectedRole === 'youth' ? 'text-blue-600' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Молодежь</span>
                            </button>
                        </div>

                        {/* OTP Login Form */}
                        <form onSubmit={handleOtpLogin} className="space-y-4">
                            {!showOtp ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-2xl border border-slate-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <AtSign size={18} className="text-blue-600" />
                                            <input 
                                                type="text" 
                                                placeholder="Твой ник в Telegram (без @)" 
                                                className="bg-transparent border-none outline-none w-full font-bold text-sm"
                                                value={tgUsername}
                                                onChange={e => setTgUsername(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setShowOtp(true)}
                                        disabled={!tgUsername}
                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 text-sm uppercase tracking-tighter active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        ПРОДОЛЖИТЬ <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in zoom-in-95">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-600/10 text-center space-y-3">
                                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none">ШАГ 2</p>
                                        <p className="text-xs font-bold leading-tight opacity-70 italic">
                                            Напиши команду <span className="text-blue-600 font-black">/login</span> боту <Link href="https://t.me/SauraN84_bot" target="_blank" className="underline">@SauraN84_bot</Link> и введи полученный код ниже.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-2xl border-2 border-blue-600/30">
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <KeyRound size={18} className="text-blue-600" />
                                            <input 
                                                type="text" 
                                                maxLength={4}
                                                placeholder="Код из 4 цифр" 
                                                className="bg-transparent border-none outline-none w-full font-black text-2xl tracking-[1em] text-center ml-4"
                                                value={otpCode}
                                                onChange={e => setOtpCode(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setShowOtp(false)}
                                            className="bg-slate-100 dark:bg-zinc-800 p-5 rounded-2xl text-slate-400 active:scale-95 transition-all"
                                        >
                                            <RefreshCcw size={20} />
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={otpCode.length < 4 || loading}
                                            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-tighter active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <>ВОЙТИ В КАБИНЕТ <LogIn size={18} /></>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                             <a 
                                href="https://t.me/SauraN84_bot" 
                                target="_blank"
                                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:underline"
                             >
                                <MessageSquare size={14} /> Открыть бота @SauraN84_bot
                             </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl font-black border border-white/30 rotate-6 shadow-xl leading-none">
                        {user.full_name?.[0]}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Привет, {user.full_name?.split(' ')[0]}!</h2>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Ты успешно авторизован</p>
                    </div>
                    
                    <div className="w-full space-y-3">
                        <Link 
                            href="/profile" 
                            className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-xl text-sm uppercase tracking-tighter"
                        >
                            ПЕРЕЙТИ В КАБИНЕТ <ChevronRight size={18} />
                        </Link>
                        <button 
                            onClick={() => { localStorage.removeItem('n84_user'); window.location.reload(); }}
                            className="w-full py-4 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest"
                        >
                            Выйти из системы
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
        <div className="text-xs font-black uppercase tracking-widest leading-none">N84 Aktau Platform © 2024</div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
           <span>Supabase Multi-Auth</span>
           <span>Qwen AI Matching</span>
           <span>Aktau Local Bot</span>
        </div>
      </footer>
    </div>
  )
}
