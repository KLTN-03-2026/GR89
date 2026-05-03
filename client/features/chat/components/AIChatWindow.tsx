'use client'

import { useEffect, useRef, useState } from 'react'
import AIChatHeader from './AIChatHeader'
import AIChatMessageList from './AIChatMessageList'
import AIChatInput from './AIChatInput'
import AIChatMinimized from './AIChatMinimized'
import { useChatbot } from '../hooks/useChatbot'

interface AIChatWindowProps {
  onClose: () => void
  lessonTitle?: string
  lessonType?: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa'
  setOpenChat: (chat: 'ai' | null) => void
}

export default function AIChatWindow({ onClose, setOpenChat }: AIChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  const {
    isLoadingPrompt,
    sendMessage,
    conversationHistory,
    isLoadingConversation,
    openChat,
  } = useChatbot()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  const handleSend = async () => {
    if (!input.trim() || isLoadingPrompt) return

    setIsLoadingChat(true)
    setInput('')
    await sendMessage(input)
    setIsLoadingChat(false)
  }

  if (isMinimized) {
    return <AIChatMinimized
      onExpand={() => { setIsMinimized(false); setOpenChat('ai') }}
      onClose={() => { setIsMinimized(false); onClose() }}
    />
  }

  return (
    <div className={`fixed bottom-4 right-6 z-[2000] flex h-[600px] w-96 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 ${openChat === 'ai' ? 'block' : 'hidden'}`}>
      <AIChatHeader onMinimize={() => setIsMinimized(true)} onClose={onClose} />

      <div className="flex-shrink-0 border-b border-gray-200 bg-purple-50 px-4 py-2 text-[11px] text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        💡 Mẹo: Hỏi ngắn gọn, nêu rõ phần trong bài để được trả lời chính xác.
      </div>

      <div className="relative flex-1 overflow-auto">
        <AIChatMessageList ref={messagesEndRef} messages={conversationHistory} isTyping={isLoadingConversation} />
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2 text-[10px] text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Trả lời dựa trên tài liệu bài học
      </div>

      <AIChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoadingPrompt || isLoadingChat}
      />
    </div>
  )
}
