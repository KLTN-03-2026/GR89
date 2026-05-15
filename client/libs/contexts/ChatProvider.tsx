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
  refreshHumanTicket: () => Promise<ChatConversation | null>
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
  const unreadCountRef = useRef<number>(0)
  const lastAssigneeMessageAtMsRef = useRef<number>(0)
  const inflightRef = useRef(false)
  const lastSoundAtMsRef = useRef<number>(0)

  const socket = useSocketStore((s) => s.socket)

  const { user } = useAuth()

  // sync ref
  useEffect(() => {
    openChatRef.current = openChat
  }, [openChat])

  useEffect(() => {
    unreadCountRef.current = unreadCount
  }, [unreadCount])

  // reset khi logout
  useEffect(() => {
    if (!user?._id) {
      setHumanTicket(null)
      setHumanMessages([])
      setUnreadCount(0)
      lastAssigneeMessageAtMsRef.current = 0
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
    if (!user?._id) return null

    try {
      const ticket = await getTicketForUser()

      setHumanTicket(ticket || null)
      setHumanMessages(ticket?.messages || [])

      const ms = ticket?.lastAssigneeMessageAt
        ? new Date(ticket.lastAssigneeMessageAt).getTime()
        : 0
      if (Number.isFinite(ms) && ms > 0) {
        lastAssigneeMessageAtMsRef.current = ms
      }

      return ticket || null
    } catch (error) {
      console.error('refreshHumanTicket error:', error)
      return null
    }
  }, [user?._id])

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0)
      return 0
    }

    try {
      const ticket = await getUnreadCountForUser()

      const next = ticket?.countUnRead || 0
      setUnreadCount(next)
      return next
    } catch (error) {
      console.error('refreshUnreadCount error:', error)
      return 0
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
      if (inflightRef.current) return
      inflightRef.current = true
      try {
        if (openChatRef.current === 'human') {
          const ticket = await refreshHumanTicket()
          const nextMs = ticket?.lastAssigneeMessageAt
            ? new Date(ticket.lastAssigneeMessageAt).getTime()
            : 0
          const prevMs = lastAssigneeMessageAtMsRef.current

          if (
            Number.isFinite(nextMs) &&
            nextMs > 0 &&
            prevMs > 0 &&
            nextMs > prevMs
          ) {
            const now = Date.now()
            if (now - lastSoundAtMsRef.current >= 1200) {
              lastSoundAtMsRef.current = now
              playSound()
            }
            lastAssigneeMessageAtMsRef.current = nextMs
          } else if (Number.isFinite(nextMs) && nextMs > 0 && prevMs === 0) {
            lastAssigneeMessageAtMsRef.current = nextMs
          }

          setUnreadCount(0)
          return
        }

        const prevUnread = unreadCountRef.current
        const nextUnread = await refreshUnreadCount()

        if (nextUnread > prevUnread) {
          const now = Date.now()
          if (now - lastSoundAtMsRef.current >= 1200) {
            lastSoundAtMsRef.current = now
            playSound()
          }
        }
      } finally {
        inflightRef.current = false
      }
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
  }, [refreshHumanTicket, refreshUnreadCount, socket])

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
