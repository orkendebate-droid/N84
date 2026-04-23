'use client'

import { useEffect, useRef } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export default function TelegramLogin({ onAuth }: { onAuth: (user: TelegramUser) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Очищаем контейнер перед добавлением скрипта
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'SauraN84_bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '15')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.async = true

    // Глобальная функция для колбэка от Telegram
    ;(window as any).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user)
    }

    containerRef.current?.appendChild(script)
  }, [onAuth])

  return (
    <div className="flex justify-center p-4">
      <div ref={containerRef} id="telegram-login-container"></div>
    </div>
  )
}
