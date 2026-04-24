'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, AtSign, Building2, User, LogIn, Loader2, ChevronRight, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'employer' | 'youth'>('employer')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  
  const [formData, setFormData] = useState({
    username: '',
    code: '',
    full_name: '',
    company_name: '',
    bin_iin: '',
    industry: ''
  })

  // Если уже залогинен - редирект
  useEffect(() => {
    const saved = localStorage.getItem('n84_user')
    if (saved) {
      router.push('/profile')
    }
  }, [router])

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
        localStorage.setItem('n84_user', JSON.stringify(data.profile))
        router.push('/profile')
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-4">
                <ArrowLeft size={14} /> Вернуться на главную
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Личный кабинет</h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Бесшовный вход через @SauraN84_bot</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-200 dark:border-zinc-800 relative">
            
            {/* Role Switcher */}
            <div className="flex bg-slate-50 dark:bg-zinc-800 p-1.5 rounded-[1.5rem] mb-10">
                <button onClick={() => { setSelectedRole('employer'); setMode('login'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedRole === 'employer' ? 'bg-white dark:bg-zinc-700 shadow-md translate-y-[-1px]' : 'opacity-40'}`}>Для бизнеса</button>
                <button onClick={() => { setSelectedRole('youth'); setMode('login'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedRole === 'youth' ? 'bg-white dark:bg-zinc-700 shadow-md translate-y-[-1px]' : 'opacity-40'}`}>Для молодежи</button>
            </div>

            {selectedRole === 'employer' && (
                <div className="flex gap-4 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-6">
                    <button onClick={() => setMode('login')} className={`text-xs font-black uppercase tracking-tighter ${mode === 'login' ? 'text-blue-600' : 'opacity-40'}`}>Вход</button>
                    <button onClick={() => setMode('register')} className={`text-xs font-black uppercase tracking-tighter ${mode === 'register' ? 'text-blue-600' : 'opacity-40'}`}>Регистрация</button>
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
                {mode === 'register' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <input className="w-full bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20" placeholder="ФИО Ответственного" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required={mode === 'register'} />
                        <input className="w-full bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20" placeholder="Название компании" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required={mode === 'register'} />
                        <input className="w-full bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-600/20" placeholder="БИН компании" value={formData.bin_iin} onChange={e => setFormData({...formData, bin_iin: e.target.value})} required={mode === 'register'} />
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center bg-slate-50 dark:bg-zinc-800 rounded-[1.5rem] px-5 group focus-within:ring-2 ring-blue-600/20 transition-all">
                        <AtSign size={18} className="text-blue-600 opacity-40 group-focus-within:opacity-100" />
                        <input className="flex-1 bg-transparent p-5 rounded-2xl text-sm font-bold border-none outline-none" placeholder="Telegram username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-600/10 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Код из бота</p>
                            <p className="text-[9px] font-bold opacity-40 leading-none">Команда /login в боте @SauraN84_bot</p>
                        </div>
                        <input className="w-20 bg-white dark:bg-zinc-700 p-3 rounded-xl text-center font-black text-xl tracking-widest border-none outline-none shadow-sm" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 text-sm uppercase tracking-tighter hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'ВОЙТИ В КАБИНЕТ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'} <LogIn size={20} /></>}
                </button>
            </form>

            {selectedRole === 'youth' && (
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800 text-center space-y-4">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Нет анкеты в системе?</p>
                    <a href="https://t.me/SauraN84_bot" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-tighter hover:underline">
                        Перейти в бота и создать анкету <ChevronRight size={14} />
                    </a>
                </div>
            )}
        </div>

        <p className="text-center text-[10px] font-black uppercase opacity-20 tracking-widest">N84 Aktau Secure Auth System</p>
      </div>
    </div>
  )
}
