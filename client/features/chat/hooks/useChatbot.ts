'use client'

import { useState } from 'react'
import { sendChatbotMessage } from '../services/chatService'
import { useLessonContext } from '@/libs/hooks/useLessonContext'
import { useChat } from '../../../libs/contexts/ChatProvider'

export function useChatbot() {
  const routeContext = useLessonContext()
  const finalLessonId = routeContext.lessonId
  const finalLessonType = routeContext.lessonType
  const { openChat } = useChat()
  const [isLoadingPrompt] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [error] = useState<Error | null>(null)
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])

  const sendMessage = async (message: string) => {
    setConversationHistory(prev => [...prev, { role: 'user' as const, content: message }])

    setIsLoadingConversation(true)
    await sendChatbotMessage(
      message,
      conversationHistory,
      finalLessonId,
      finalLessonType as 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa' | undefined
    )
      .then(response => {
        const aiMessage = { role: 'assistant' as const, content: response }
        setConversationHistory(prev => [...prev, aiMessage])
        setIsLoadingConversation(false)
      })
      .catch(err => {
        setConversationHistory(prev => [
          ...prev,
          { role: 'assistant' as const, content: err.response?.data?.message || 'Lỗi khi gửi message' }
        ])
      })
      .then(() => {
        setIsLoadingConversation(false)
      })
  }

  return {
    isLoadingPrompt,
    error,
    setConversationHistory,
    sendMessage,
    conversationHistory,
    finalLessonId,
    isLoadingConversation,
    openChat
  }
}
