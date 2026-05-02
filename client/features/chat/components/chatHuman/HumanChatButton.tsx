'use client'

import { Headset } from 'lucide-react'
import HumanChatWindow from './HumanChatWindow'
import { useChat } from '../../context/ChatProvider'

export default function HumanChatButton() {
  const { openChat, setOpenChat } = useChat()
  const isOpen = openChat === 'human'

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setOpenChat('human')}
          className="group fixed bottom-20 right-6 z-50 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full p-4 shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 border-2 border-white"
          aria-label="Chat với hỗ trợ"
        >
          <Headset className="w-6 h-6" />

          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <Headset className="w-4 h-4 text-indigo-300" />
            <span>Hỗ trợ trực tuyến</span>
          </span>
        </button>
      )}

      <HumanChatWindow
        onClose={() => setOpenChat(null)}
        setOpenChat={setOpenChat}
      />
    </>
  )
}
