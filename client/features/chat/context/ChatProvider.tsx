'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ChatType = 'ai' | 'human' | null

interface ChatContextType {
  openChat: ChatType
  setOpenChat: (chat: ChatType) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChat, setOpenChat] = useState<ChatType>(null)

  return (
    <ChatContext.Provider value={{ openChat, setOpenChat }}>
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
