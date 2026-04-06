'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import HumanSupportWindow from './HumanSupportWindow'
import { useChat } from '../context/ChatProvider'

export default function HumanSupportButton() {
  const { openChat, setOpenChat } = useChat()
  const isOpen = openChat === 'human'
  const [unreadCount] = useState(0)

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setOpenChat('human')}
          className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Chat với giáo viên"
        >
          <MessageCircle className="w-6 h-6" />

          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-2 py-1 text-xs animate-pulse">
              {unreadCount}
            </Badge>
          )}

          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Chat với giáo viên
          </span>
        </button>
      )}

      {isOpen && <HumanSupportWindow onClose={() => setOpenChat(null)} />}
    </>
  )
}
