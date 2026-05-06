'use client'

import { MessageSquare, Sparkles } from 'lucide-react'
import AIChatWindow from './AIChatWindow'
import { useChat } from '../../../../libs/contexts/ChatProvider'

export default function AIChatButton() {
  const { openChat, setOpenChat } = useChat()
  const isOpen = openChat === 'ai'

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setOpenChat('ai')}
          className="group fixed bottom-4 right-6 z-50 bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white rounded-full p-4 shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
          aria-label="Mở chat AI"
        >
          <MessageSquare className="w-6 h-6" />

          <span className="absolute -top-2 -right-1 bg-amber-400/90 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI
          </span>

          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <MessageSquare className="w-4 h-4 text-purple-300" />
            <span>Chat với AI</span>
          </span>
        </button>
      )}

      <AIChatWindow
        onClose={() => setOpenChat(null)}
        setOpenChat={setOpenChat}
      />
    </>
  )
}
