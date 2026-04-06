'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function sendChatbotMessage(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  lessonId?: string,
  lessonType?: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa'
): Promise<string> {
  const response = await authorizedAxios.post<ApiResponse<string>>('/chatbot/chat', {
    message,
    conversationHistory,
    lessonId,
    lessonType
  })
  return response.data.data
}
