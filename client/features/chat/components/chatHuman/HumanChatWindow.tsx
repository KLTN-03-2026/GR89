'use client'

import { useEffect, useRef, useState } from 'react'
import HumanChatHeader from './HumanChatHeader'
import HumanChatMessageList from './HumanChatMessageList'
import HumanChatInput from './HumanChatInput'
import HumanChatMinimized from './HumanChatMinimized'
import { useChat } from '../../../../libs/contexts/ChatProvider'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HumanChatWindowProps {
  onClose: () => void
  setOpenChat: (chat: 'human' | null) => void
}

export default function HumanChatWindow({ onClose, setOpenChat }: HumanChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { openChat, humanMessages, sendHumanMessage } = useChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [humanMessages, openChat])

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      await sendHumanMessage(input)
    } finally {
      setInput('')
    }
  }

  const handleSendFile = (file: File) => {
    console.log(file)
  }

  if (isMinimized) {
    return <HumanChatMinimized
      onExpand={() => { setIsMinimized(false); setOpenChat('human') }}
      onClose={() => { setIsMinimized(false); onClose() }}
    />
  }

  return (
    <div className={`fixed bottom-4 right-6 z-[2000] flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom-4 duration-300 ${openChat === 'human' ? 'flex' : 'hidden'}`}>
      <HumanChatHeader onMinimize={() => setIsMinimized(true)} onClose={onClose} />

      <div className="flex-shrink-0 border-b border-indigo-50 bg-indigo-50/30 px-4 py-2 text-[11px] text-indigo-700 font-bold dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
        📢 Đội ngũ hỗ trợ đang trực tuyến (Thời gian phản hồi ~5p)
      </div>

      <ScrollArea className="flex-1 overflow-auto bg-gray-50/30">
        <HumanChatMessageList ref={messagesEndRef} messages={humanMessages} />
      </ScrollArea>

      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-1.5 text-[10px] text-gray-400 font-medium dark:border-gray-800 dark:bg-gray-900">
        Bằng cách bắt đầu chat, bạn đồng ý với điều khoản hỗ trợ của chúng tôi.
      </div>

      <HumanChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onSendFile={handleSendFile}
      />
    </div>
  )
}
