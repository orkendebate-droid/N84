'use client'

import { useEffect, useRef } from 'react'

interface Props {
  botUsername: string
  onAuth: (user: any) => void
  buttonSize?: 'small' | 'medium' | 'large'
}

export default function TelegramLogin({ botUsername, onAuth, buttonSize = 'large' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Очищаем контейнер перед добавлением скрипта
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Создаем глобальную функцию обратного вызова, которую вызовет TG
    (window as any).onTelegramAuth = (user: any) => {
      onAuth(user)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    
    containerRef.current?.appendChild(script)
  }, [botUsername, onAuth, buttonSize])

  return (
    <div className="flex justify-center items-center py-4" ref={containerRef} />
  )
}
