'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSocketStore } from '@/hooks/useSocketStore'
import { useAuth } from './AuthContext'
import {
  getSupportTicketDetailForStaff,
  getSupportTicketsForStaff,
} from '@/features/center-management/support/services/api'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const connectSocket = useSocketStore((s) => s.connectSocket)
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket)
  const socket = useSocketStore((s) => s.socket)
  const pathname = usePathname()

  const hasConnectedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastMessageAtByTicketRef = useRef<Map<string, string | null>>(new Map())
  const inflightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (user?._id) {
      if (!hasConnectedRef.current) {
        connectSocket()
        hasConnectedRef.current = true
      }
    } else {
      disconnectSocket()
      hasConnectedRef.current = false
    }
    return () => {
      disconnectSocket()
    }
  }, [user?._id, connectSocket, disconnectSocket])

  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  useEffect(() => {
    if (user?._id) return
    lastMessageAtByTicketRef.current.clear()
    inflightRef.current.clear()
  }, [user?._id])

  useEffect(() => {
    if (!socket) return
    if (!user?._id) return

    let alive = true

    const playSound = () => {
      audioRef.current?.play().catch(() => {})
    }

    const isSupportPage = pathname.includes('/center-management/support')

    const preload = async () => {
      try {
        const res = await getSupportTicketsForStaff({ status: 'open' })
        if (!alive) return
        for (const t of res.data || []) {
          lastMessageAtByTicketRef.current.set(t._id, t.lastMessageAt || null)
        }
      } catch {
      }
    }

    preload()

    const onTicketUpdated = async (payload: { ticketId?: string }) => {
      if (!payload?.ticketId) return
      if (isSupportPage) return

      const ticketId = payload.ticketId
      if (inflightRef.current.has(ticketId)) return
      inflightRef.current.add(ticketId)

      try {
        const prevLastMessageAt = lastMessageAtByTicketRef.current.get(ticketId) || null
        const res = await getSupportTicketDetailForStaff(ticketId)
        const ticket = res.data
        const nextLastMessageAt = ticket?.lastMessageAt || null
        lastMessageAtByTicketRef.current.set(ticketId, nextLastMessageAt)

        const lastMsg = ticket?.messages?.length ? ticket.messages[ticket.messages.length - 1] : null
        if (
          prevLastMessageAt &&
          nextLastMessageAt &&
          nextLastMessageAt !== prevLastMessageAt &&
          lastMsg?.sender?.role === 'user'
        ) {
          playSound()
        }
      } finally {
        inflightRef.current.delete(ticketId)
      }
    }

    socket.on('ticket:updated', onTicketUpdated)

    return () => {
      alive = false
      socket.off('ticket:updated', onTicketUpdated)
    }
  }, [socket, user?._id, pathname])
  return <>{children}</>
}
