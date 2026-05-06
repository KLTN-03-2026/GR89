'use client'

import { ChatAttachment, ChatConversation } from '@/features/chat/types'
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

/* =================HUMAN CHAT============ */
// (USER) Lấy chi tiết ticket
export async function getTicketForUser() {
  const listResponse = await authorizedAxios.get<ApiResponse<ChatConversation>>('/support-chat/tickets')

  return listResponse.data.data
}

// (USER) Gửi tin nhắn
export async function sendMessageAsRequester(
  content: string,
  attachments?: ChatAttachment[],
) {
    const createResponse = await authorizedAxios.post<ApiResponse<ChatConversation>>('/support-chat/tickets/messages', {
      content,
      attachments,
    })

    return createResponse.data.data
}

// (USER) Lấy số lượng tin nhắn chưa phản hồi
export async function getUnreadCountForUser() {
    const countResponse = await authorizedAxios.get<ApiResponse<ChatConversation>>('/support-chat/tickets/unread-count')

    return countResponse.data.data
}