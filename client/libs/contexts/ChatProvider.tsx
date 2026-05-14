'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react'

import { useSocketStore } from '@/libs/hooks/useSocketStore'
import { useAuth } from '@/libs/contexts/AuthContext'

import {
  ChatAttachment,
  ChatConversation,
  ChatMessage,
} from '@/features/chat/types'

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
  sendHumanMessage: (
    content: string,
    attachments?: ChatAttachment[]
  ) => Promise<void>
  unreadCount: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChat, setOpenChat] = useState<ChatType>(null)

  const [humanTicket, setHumanTicket] =
    useState<ChatConversation | null>(null)

  const [humanMessages, setHumanMessages] = useState<ChatMessage[]>([])

  const [unreadCount, setUnreadCount] = useState<number>(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // FIX: dùng ref để tránh socket effect rerun liên tục
  const openChatRef = useRef<ChatType>(null)

  const socket = useSocketStore((s) => s.socket)

  const { user } = useAuth()

  // sync ref
  useEffect(() => {
    openChatRef.current = openChat
  }, [openChat])

  // reset khi logout
  useEffect(() => {
    if (!user?._id) {
      setHumanTicket(null)
      setHumanMessages([])
      setUnreadCount(0)
    }
  }, [user?._id])

  // preload audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const playSound = () => {
    audioRef.current?.play().catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Audio blocked:', err)
      }
    })
  }

  const refreshHumanTicket = useCallback(async () => {
    if (!user?._id) return

    try {
      const ticket = await getTicketForUser()

      setHumanTicket(ticket || null)
      setHumanMessages(ticket?.messages || [])
    } catch (error) {
      console.error('refreshHumanTicket error:', error)
    }
  }, [user?._id])

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0)
      return
    }

    try {
      const ticket = await getUnreadCountForUser()

      setUnreadCount(ticket?.countUnRead || 0)
    } catch (error) {
      console.error('refreshUnreadCount error:', error)
    }
  }, [user?._id])

  const sendHumanMessage = useCallback(
    async (content: string, attachments?: ChatAttachment[]) => {
      if (!user?._id) return

      try {
        const ticket = await sendMessageAsRequester(
          content,
          attachments
        )

        setHumanTicket(ticket || null)
        setHumanMessages(ticket?.messages || [])
      } catch (error) {
        console.error('sendHumanMessage error:', error)
      }
    },
    [user?._id]
  )

  // load unread count lần đầu
  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  // mở chat => load ticket
  useEffect(() => {
    if (openChat !== 'human') return

    refreshHumanTicket().finally(() => {
      setUnreadCount(0)
    })
  }, [openChat, refreshHumanTicket])

  // socket listener
  useEffect(() => {
    if (!socket) return

    const onTicketUpdated = async () => {
      console.log('ticket updated')

      // đang mở chat
      if (openChatRef.current === 'human') {
        await refreshHumanTicket()

        setUnreadCount(0)

        playSound()

        return
      }

      // chưa mở chat
      playSound()

      await refreshUnreadCount()
    }

    const onReadAll = async () => {
      await refreshUnreadCount()
    }

    socket.on('ticket:updated', onTicketUpdated)

    socket.on('message:readAll', onReadAll)

    return () => {
      socket.off('ticket:updated', onTicketUpdated)

      socket.off('message:readAll', onReadAll)
    }
  }, [socket])

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