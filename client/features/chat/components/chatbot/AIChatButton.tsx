'use client'

import { MessageSquare, Sparkles } from 'lucide-react'
import AIChatWindow from './AIChatWindow'
import { useChat } from '../../../../libs/contexts/ChatProvider'
import { cn } from '@/libs/utils'

interface AIChatButtonProps {
  floating?: boolean
  className?: string
}

export default function AIChatButton({ floating = true, className }: AIChatButtonProps) {
  const { openChat, setOpenChat } = useChat()
  const isOpen = openChat === 'ai'

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setOpenChat('ai')}
          className={cn(
            'group relative flex items-center justify-center bg-gradient-to-br w-16 h-16 from-fuchsia-500 to-purple-600 text-white rounded-full p-4 shadow-xl border-2 border-white hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300',
            floating && 'fixed bottom-4 right-6 z-50',
            className
          )}
          aria-label="Mở chat AI"
        >
          <MessageSquare className="w-8 h-8" />

          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-fuchsia-500 border-2 border-white"></span>
          </span>

          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <MessageSquare className="w-4 h-4 text-purple-300" />
            <span>Chat với AI</span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold">
              <Sparkles className="h-3 w-3" />
              AI
            </span>
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
