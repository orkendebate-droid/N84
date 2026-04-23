'use client'

import { useState } from 'react'
import { Briefcase, Users, Bot, MapPin, Search, ArrowRight } from "lucide-react";
import Link from 'next/link'
import TelegramLogin from '@/components/TelegramLogin'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  const handleAuth = async (tgUser: any) => {
    console.log('Authenticated:', tgUser)
    setUser(tgUser)
    
    try {
      await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser)
      })
    } catch (err) {
      console.error('Failed to save user:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20">S</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Saura</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest opacity-70">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <Link href="#features" className="hover:text-blue-600 transition-colors">Возможности</Link>
            <Link href="#about" className="hover:text-blue-600 transition-colors">О проекте</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                  {user.first_name[0]}
                </div>
                <span className="font-bold text-sm">{user.first_name}</span>
              </div>
            ) : (
              <TelegramLogin onAuth={handleAuth} />
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-fade-in">
            <Bot size={14} />
            <span>AI-Driven Platform for Youth</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl">
            РАБОТА В <span className="text-blue-600 italic">АКТАУ</span> СТАЛА ПРОЩЕ
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Цифровая платформа занятости, объединяющая малый бизнес и молодежь Мангистау. Быстрый поиск сотрудников через AI и удобный Telegram-бот.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {user ? (
              <Link href="/vacancies/new" className="group relative bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all flex items-center gap-3 text-lg">
                Опубликовать вакансию
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-4">
                 <p className="text-sm font-bold uppercase tracking-widest opacity-40 mb-2">Войти через Telegram, чтобы начать</p>
                 <TelegramLogin onAuth={handleAuth} />
              </div>
            )}
            <button className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 px-10 py-5 rounded-[2rem] font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-lg">
              Как это работает?
            </button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-white dark:bg-zinc-900 py-32 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <Bot />
              </div>
              <h3 className="text-2xl font-black tracking-tight">AI Matching</h3>
              <p className="opacity-60 leading-relaxed font-medium">Qwen AI анализирует вакансии и находит лучших кандидатов по навыкам и району проживания в Актау.</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-blue-600">
                <MapPin />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Geo Logic</h3>
              <p className="opacity-60 leading-relaxed font-medium">Поиск работы рядом с домом. Укажите свой микрорайон и получайте предложения только из вашего района.</p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-blue-600">
                <Search />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Fast Onboarding</h3>
              <p className="opacity-60 leading-relaxed font-medium">Регистрация в один клик через Telegram. Никаких паролей и длинных резюме — сразу к делу.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-black italic">S</div>
            <span className="text-sm font-black uppercase italic">Saura Platform 2024</span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-40">
            Made for Hackathon Decentrathon 5.0
          </div>
        </div>
      </footer>
    </div>
  )
}
