'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocketStore } from '@/hooks/useSocketStore'
import { SupportTicket } from '../type'
import {
  claimSupportTicket,
  getSupportTicketDetailForStaff,
  getSupportTicketsForStaff,
  sendSupportMessageAsStaff,
} from '../services/api'

interface SupportChatContextType {
  tickets: SupportTicket[]
  selectedTicketId: string
  selectedTicket: SupportTicket | null
  newCount: number
  canTakeOver: boolean
  canReply: boolean
  selectTicketId: (ticketId: string) => void
  refreshTickets: () => Promise<void>
  refreshTicketDetail: (ticketId: string) => Promise<void>
  claimSelectedTicket: () => Promise<void>
  sendMessageAsStaff: (content: string) => Promise<void>
}

const SupportChatContext = createContext<SupportChatContextType | undefined>(undefined)

export function SupportChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const socket = useSocketStore((s) => s.socket)

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const lastSelectedMessageAtRef = useRef<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const playSound = () => {
    audioRef.current?.play().catch(() => {})
  }

  const newCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'open' && t.waitingFor === 'assignee').length
  }, [tickets])

  const canTakeOver = useMemo(() => {
    if (!selectedTicket) return false
    if (selectedTicket.status !== 'open') return false
    if (selectedTicket.waitingFor !== 'assignee') return false
    if (!selectedTicket.assignedTo) return true
    if (!selectedTicket.lastRequesterMessageAt) return false

    const lastRequesterAt = new Date(selectedTicket.lastRequesterMessageAt).getTime()
    const lastAssigneeAt = selectedTicket.lastAssigneeMessageAt
      ? new Date(selectedTicket.lastAssigneeMessageAt).getTime()
      : 0

    if (lastAssigneeAt >= lastRequesterAt) return false
    return Date.now() - lastRequesterAt > 5 * 60 * 1000
  }, [selectedTicket])

  const canReply = useMemo(() => {
    if (!selectedTicket) return false
    if (selectedTicket.status !== 'open') return false
    if (!user?._id) return false
    if (!selectedTicket.assignedTo) return false
    return selectedTicket.assignedTo._id === user._id
  }, [selectedTicket, user?._id])

  const refreshTickets = useCallback(async () => {
    const res = await getSupportTicketsForStaff({ status: 'open' })
    const list = res.data || []
    setTickets(list)
    setSelectedTicketId((prev) => (prev ? prev : list[0]?._id || ''))
  }, [])

  const refreshTicketDetail = useCallback(async (ticketId: string) => {
    if (!ticketId) {
      setSelectedTicket(null)
      lastSelectedMessageAtRef.current = null
      return
    }
    const res = await getSupportTicketDetailForStaff(ticketId)
    const ticket = res.data || null
    setSelectedTicket(ticket)
    if (ticketId === selectedTicketId) {
      lastSelectedMessageAtRef.current = ticket?.lastMessageAt || null
    }
  }, [selectedTicketId])

  const refreshSelectedTicketOnUpdate = useCallback(
    async (ticketId: string) => {
      if (!ticketId) return
      const prevLastMessageAt = lastSelectedMessageAtRef.current
      const res = await getSupportTicketDetailForStaff(ticketId)
      const ticket = res.data || null
      setSelectedTicket(ticket)

      const nextLastMessageAt = ticket?.lastMessageAt || null
      const lastMsg = ticket?.messages?.length ? ticket.messages[ticket.messages.length - 1] : null

      if (prevLastMessageAt && nextLastMessageAt && nextLastMessageAt !== prevLastMessageAt) {
        if (lastMsg?.sender?.role === 'user') {
          playSound()
        }
      }

      lastSelectedMessageAtRef.current = nextLastMessageAt
    },
    [],
  )

  const claimSelectedTicket = useCallback(async () => {
    if (!selectedTicketId) return
    await claimSupportTicket(selectedTicketId, 5)
    await refreshTickets()
    await refreshTicketDetail(selectedTicketId)
  }, [selectedTicketId, refreshTickets, refreshTicketDetail])

  const sendMessageAsStaff = useCallback(
    async (content: string) => {
      if (!selectedTicketId) return
      await sendSupportMessageAsStaff(selectedTicketId, content)
      await refreshTickets()
      await refreshTicketDetail(selectedTicketId)
    },
    [selectedTicketId, refreshTickets, refreshTicketDetail],
  )

  const selectTicketId = useCallback((ticketId: string) => {
    setSelectedTicketId(ticketId)
  }, [])

  useEffect(() => {
    refreshTickets()
  }, [refreshTickets])

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null)
      lastSelectedMessageAtRef.current = null
      return
    }
    refreshTicketDetail(selectedTicketId)
  }, [selectedTicketId, refreshTicketDetail])

  useEffect(() => {
    if (!socket) return

    const onStaffTicketUpdated = (payload: { ticketId?: string }) => {
      refreshTickets()

      if (payload?.ticketId && payload.ticketId === selectedTicketId) {
        refreshSelectedTicketOnUpdate(payload.ticketId)
      }
    }

    socket.on('ticket:updated', onStaffTicketUpdated)

    return () => {
      socket.off('ticket:updated', onStaffTicketUpdated)
    }
  }, [socket, selectedTicketId, refreshTickets, refreshSelectedTicketOnUpdate])

  return (
    <SupportChatContext.Provider
      value={{
        tickets,
        selectedTicketId,
        selectedTicket,
        newCount,
        canTakeOver,
        canReply,
        selectTicketId,
        refreshTickets,
        refreshTicketDetail,
        claimSelectedTicket,
        sendMessageAsStaff,
      }}
    >
      {children}
    </SupportChatContext.Provider>
  )
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext)
  if (!ctx) throw new Error('useSupportChat must be used within SupportChatProvider')
  return ctx
}
