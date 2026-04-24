'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Bot, ArrowRight, Send, ShieldCheck, TrendingUp, Globe, Sparkles, MessageSquare, ChevronRight, User } from "lucide-react";
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 blur-[130px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-400 blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform">N</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">N84</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest opacity-60">
             <Link href="/board" className="hover:text-blue-600 transition-colors">Доска вакансий</Link>
             <a href="https://t.me/SauraN84_bot" target="_blank" className="hover:text-blue-600 transition-colors">Бот в Телеграм</a>
             <Link href="/login" className="hover:text-blue-600 transition-colors">Вход / Регистрация</Link>
          </div>

          {user ? (
            <Link href="/profile" className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm hover:border-blue-600 transition-all group">
              <span className="font-bold text-sm tracking-tight">{user.full_name}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase">{user.full_name?.[0]}</div>
            </Link>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.03] active:scale-95 transition-all">Войти</Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* Main Hero */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-fade-in">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Hackathon Project - Aktau 2024</span>
            </div>
            
            <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.95] uppercase italic">
                  ТВОЯ <span className="text-blue-600 not-italic">КАРЬЕРА</span><br/> НАЧИНАЕТСЯ ЗДЕСЬ
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-xl self-center mx-auto lg:mx-0 leading-relaxed font-medium">
                   ИИ-платформа Актау, которая помогает молодежи найти работу мечты через умного бота и мгновенные пуши. 🌊🚀
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
                <Link href="/login" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-tighter flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-[1.03] active:scale-95 transition-all group">
                   ЛИЧНЫЙ КАБИНЕТ <User size={20} className="group-hover:rotate-12 transition-transform" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-tighter flex items-center justify-center gap-3 shadow-md hover:border-blue-600 transition-all">
                   РАЗМЕСТИТЬ ВАКАНСИЮ <Briefcase size={20} />
                </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-10">
               <div className="space-y-1 border-l-2 border-blue-600 pl-4 text-left">
                 <p className="text-2xl font-black leading-none">500+</p>
                 <p className="text-[9px] font-black uppercase opacity-40 tracking-widest leading-none">Соискателей</p>
               </div>
               <div className="space-y-1 border-l-2 border-blue-600 pl-4 text-left">
                 <p className="text-2xl font-black leading-none">120+</p>
                 <p className="text-[9px] font-black uppercase opacity-40 tracking-widest leading-none">Компаний</p>
               </div>
               <div className="space-y-1 border-l-2 border-blue-600 pl-4 text-left">
                 <p className="text-2xl font-black leading-none italic">AI</p>
                 <p className="text-[9px] font-black uppercase opacity-40 tracking-widest leading-none">Matching</p>
               </div>
            </div>
          </div>

          {/* Side Graphic / Info */}
          <div className="flex-1 w-full max-w-lg animate-in fade-in zoom-in duration-1000 hidden xl:block">
             <div className="bg-slate-50 dark:bg-zinc-900 rounded-[4rem] p-12 border border-slate-200 dark:border-zinc-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="space-y-8 relative">
                   <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                      <ShieldCheck size={32} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Почему выбирают N84?</h3>
                      <p className="text-sm font-medium opacity-60 leading-relaxed">Система использует Qwen-max для анализа твоего профиля и подбирает работу только в твоем районе Актау. Никакого спама — только реальные предложения.</p>
                   </div>
                   <ul className="space-y-4 pt-4 text-xs font-black uppercase tracking-widest">
                      <li className="flex items-center gap-3 text-blue-600"><div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div> Мгновенные пуши в Телеграм</li>
                      <li className="flex items-center gap-3 opacity-40"><div className="w-2 h-2 bg-slate-300 dark:bg-zinc-700 rounded-full"></div> Только верифицированные BIN</li>
                      <li className="flex items-center gap-3 opacity-40"><div className="w-2 h-2 bg-slate-300 dark:bg-zinc-700 rounded-full"></div> Фильтр по микрорайонам</li>
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8 opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
         <div className="flex items-center gap-3">
            <Globe size={14} />
            <span>N84 Platform Aktau © 2024</span>
         </div>
         <div className="flex gap-8 italic">
            <span>Powered by Qwen AI</span>
            <span>GrammY Core</span>
            <span>Supabase Cloud</span>
         </div>
      </footer>
    </div>
  )
}
