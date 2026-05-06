'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { useSocketStore } from '@/libs/hooks/useSocketStore'
import { useAuth } from '@/libs/contexts/AuthContext'
import { ChatAttachment, ChatConversation, ChatMessage } from '@/features/chat/types'
import {
  getTicketForUser,
  getUnreadCountForUser,
  sendMessageAsRequester,
} from '@/features/chat/services/chatService'

export type ChatType = 'ai' | 'human' | null

interface ChatContextType {
  openChat: ChatType
  setOpenChat: (chat: ChatType) => void
  humanTicket: ChatConversation | null
  humanMessages: ChatMessage[]
  refreshHumanTicket: () => Promise<void>
  sendHumanMessage: (content: string, attachments?: ChatAttachment[]) => Promise<void>
  unreadCount: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChat, setOpenChat] = useState<ChatType>(null)
  const [humanTicket, setHumanTicket] = useState<ChatConversation | null>(null)
  const [humanMessages, setHumanMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const socket = useSocketStore((s) => s.socket)
  const { user } = useAuth()

  useEffect(() => {
    if (user?._id) return
    setHumanTicket(null)
    setHumanMessages([])
    setUnreadCount(0)
  }, [user?._id])

  const refreshHumanTicket = useCallback(async () => {
    if (!user?._id) return
    const ticket = await getTicketForUser()
    setHumanTicket(ticket || null)
    setHumanMessages(ticket?.messages || [])
  }, [user?._id])

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0)
      return
    }
    const ticket = await getUnreadCountForUser()
    setUnreadCount(ticket?.countUnRead || 0)
  }, [user?._id])

  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const playSound = () => {
    audioRef.current?.play().catch(() => {})
  }

  const sendHumanMessage = useCallback(
    async (content: string, attachments?: ChatAttachment[]) => {
      if (!user?._id) return
      
      const ticket = await sendMessageAsRequester(content, attachments)
      setHumanTicket(ticket || null)
      setHumanMessages(ticket?.messages || [])
    },
    [user?._id]
  )

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  useEffect(() => {
    if (openChat !== 'human') return
    refreshHumanTicket().finally(() => setUnreadCount(0))
  }, [openChat, refreshHumanTicket])

  useEffect(() => {
    if (!socket) return

    const onTicketUpdated = () => {
      if (openChat === 'human') {
        refreshHumanTicket().finally(() => setUnreadCount(0))
        // playSound()
        return
      }
      playSound()
      refreshUnreadCount()
    }

    socket.on('ticket:updated', onTicketUpdated)
    socket.on('message:readAll', onTicketUpdated)

    return () => {
      socket.off('ticket:updated', onTicketUpdated)
      socket.off('message:readAll', onTicketUpdated)
    }
  }, [socket, openChat, refreshHumanTicket, refreshUnreadCount])

  return (
    <ChatContext.Provider
      value={{
        openChat,
        setOpenChat,
        humanTicket,
        humanMessages,
        refreshHumanTicket,
        sendHumanMessage,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
