'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocketStore } from '@/hooks/useSocketStore'
import { SupportAttachment, SupportTicket } from '../type'
import {
  claimSupportTicket,
  getSupportTicketDetailForStaff,
  getSupportTicketsForStaff,
  sendSupportMessageAsStaff,
} from '../services/api'

type RefreshTicketDetailOptions = {
  // Chỉ bật loading skeleton khi cần.
  showLoading?: boolean
  minDurationMs?: number
}

interface SupportChatContextType {
  tickets: SupportTicket[]
  selectedTicketId: string
  selectedTicket: SupportTicket | null
  newCount: number
  canTakeOver: boolean
  canReply: boolean
  // Loading dành riêng cho trường hợp chuyển ticket (đổi cuộc hội thoại).
  isSelectedTicketLoading: boolean
  selectTicketId: (ticketId: string) => void
  refreshTickets: () => Promise<void>
  refreshTicketDetail: (ticketId: string, options?: RefreshTicketDetailOptions) => Promise<void>
  claimSelectedTicket: () => Promise<void>
  sendMessageAsStaff: (content: string, attachments?: SupportAttachment) => Promise<void>
}

const SupportChatContext = createContext<SupportChatContextType | undefined>(undefined)

export function SupportChatProvider({
  children,
  initialTickets,
  initialSelectedTicketId,
  initialSelectedTicket,
}: {
  children: React.ReactNode
  initialTickets?: SupportTicket[]
  initialSelectedTicketId?: string
  initialSelectedTicket?: SupportTicket | null
}) {
  const { user } = useAuth()
  const socket = useSocketStore((s) => s.socket)

  // Danh sách ticket ở cột trái.
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets || [])
  // Ticket đang được chọn để hiển thị chat.
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialSelectedTicketId || initialTickets?.[0]?._id || '',
  )
  // Chi tiết ticket đang hiển thị (bao gồm messages).
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(initialSelectedTicket || null)
  // Loading khi chuyển ticket (hiển thị skeleton ở header/messages + disable input).
  const [isSelectedTicketLoading, setIsSelectedTicketLoading] = useState(false)
  // Dùng để so sánh khi có tin nhắn mới (phục vụ play sound / hạn chế gọi thừa).
  const lastSelectedMessageAtRef = useRef<string | null>(null)
  // Chống race-condition: khi user bấm đổi ticket liên tục, chỉ request mới nhất được áp dụng.
  const ticketDetailRequestSeqRef = useRef(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    // Âm thanh báo tin nhắn mới (chỉ play khi học viên nhắn).
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const playSound = () => {
    audioRef.current?.play().catch(() => {})
  }

  const newCount = useMemo(() => {
    // Đếm số ticket đang "mới" (đang mở và đang chờ assignee).
    return tickets.filter((t) => t.status === 'open' && t.waitingFor === 'assignee').length
  }, [tickets])

  const canTakeOver = useMemo(() => {
    // Cho phép "Nhận phản hồi" khi:
    // - ticket open, đang chờ assignee
    // - chưa có người nhận, hoặc đã quá 5 phút kể từ tin nhắn cuối của học viên mà assignee chưa trả lời
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
    // Chỉ assignee của ticket mới được trả lời (và ticket phải đang open).
    if (!selectedTicket) return false
    if (selectedTicket.status !== 'open') return false
    if (!user?._id) return false
    if (!selectedTicket.assignedTo) return false
    return selectedTicket.assignedTo._id === user._id
  }, [selectedTicket, user?._id])

  const refreshTickets = useCallback(async () => {
    // Refresh danh sách ticket (cột trái).
    const res = await getSupportTicketsForStaff({ status: 'open' })
    const list = res.data || []
    setTickets(list)
    setSelectedTicketId((prev) => (prev ? prev : list[0]?._id || ''))
  }, [])

  const refreshTicketDetail = useCallback(async (ticketId: string, options?: RefreshTicketDetailOptions) => {
    // Refresh chi tiết ticket (messages). Lưu ý:
    // - showLoading=true chỉ dùng khi chuyển ticket để UI có skeleton rõ ràng.
    // - Khi gửi tin nhắn / sync tin nhắn mới => showLoading để false để không "loading" liên tục.
    const showLoading = options?.showLoading ?? false
    const minDurationMs = options?.minDurationMs ?? 0
    if (!ticketId) {
      setSelectedTicket(null)
      lastSelectedMessageAtRef.current = null
      setIsSelectedTicketLoading(false)
      return
    }
    const requestSeq = ++ticketDetailRequestSeqRef.current
    const startedAt = Date.now()
    if (showLoading) setIsSelectedTicketLoading(true)
    try {
      const res = await getSupportTicketDetailForStaff(ticketId)
      const ticket = res.data || null
      if (showLoading && minDurationMs > 0) {
        const elapsed = Date.now() - startedAt
        const remaining = minDurationMs - elapsed
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
      }
      // Nếu trong lúc chờ API user đã chọn ticket khác => bỏ kết quả cũ để tránh setState sai.
      if (requestSeq !== ticketDetailRequestSeqRef.current) return
      setSelectedTicket(ticket)
      if (ticketId === selectedTicketId) lastSelectedMessageAtRef.current = ticket?.lastMessageAt || null
    } finally {
      if (showLoading && requestSeq === ticketDetailRequestSeqRef.current) setIsSelectedTicketLoading(false)
    }
  }, [selectedTicketId])

  const refreshSelectedTicketOnUpdate = useCallback(
    async (ticketId: string) => {
      // Khi socket báo ticket hiện tại có update:
      // - Chỉ refresh data, KHÔNG bật loading để tránh UX bị giật.
      if (!ticketId) return
      const prevLastMessageAt = lastSelectedMessageAtRef.current
      const res = await getSupportTicketDetailForStaff(ticketId)
      const ticket = res.data || null
      setSelectedTicket(ticket)

      const nextLastMessageAt = ticket?.lastMessageAt || null
      const lastMsg = ticket?.messages?.length ? ticket.messages[ticket.messages.length - 1] : null

      if (prevLastMessageAt && nextLastMessageAt && nextLastMessageAt !== prevLastMessageAt) {
        if (lastMsg?.sender?.role === 'user') {
          // Chỉ phát âm thanh nếu tin nhắn mới đến từ học viên.
          playSound()
        }
      }

      lastSelectedMessageAtRef.current = nextLastMessageAt
    },
    [],
  )

  const claimSelectedTicket = async () => {
    // Nhận xử lý ticket: sau đó refresh list + detail.
    if (!selectedTicketId) return
    await claimSupportTicket(selectedTicketId, 5)
    await refreshTickets()
    await refreshTicketDetail(selectedTicketId)
  }

  const sendMessageAsStaff = async (content: string, attachments?: SupportAttachment) => {
    if (!selectedTicketId) return
    await sendSupportMessageAsStaff(selectedTicketId, content, attachments)
    await refreshTickets()
    // Refresh để lấy message mới, nhưng không bật loading.
    await refreshTicketDetail(selectedTicketId)
  }

  const selectTicketId = useCallback((ticketId: string) => {
    // Khi user click chọn ticket mới:
    // - set selectedTicket = null để UI chuyển sang skeleton/empty ngay
    // - việc fetch detail sẽ chạy trong useEffect bên dưới
    if (ticketId && ticketId !== selectedTicketId) setIsSelectedTicketLoading(true)
    setSelectedTicketId(ticketId)
    setSelectedTicket(null)
    lastSelectedMessageAtRef.current = null
  }, [selectedTicketId])

  useEffect(() => {
    // Load list ngay khi vào trang.
    refreshTickets()
  }, [refreshTickets])

  useEffect(() => {
    // Mỗi khi selectedTicketId đổi => fetch detail và bật loading (skeleton) để có hiệu ứng chuyển hội thoại.
    if (!selectedTicketId) {
      setSelectedTicket(null)
      lastSelectedMessageAtRef.current = null
      return
    }
    if (selectedTicket && selectedTicket._id === selectedTicketId && Array.isArray(selectedTicket.messages)) {
      lastSelectedMessageAtRef.current = selectedTicket?.lastMessageAt || null
      return
    }
    refreshTicketDetail(selectedTicketId, { showLoading: true, minDurationMs: 250 })
  }, [refreshTicketDetail, selectedTicket, selectedTicketId])

  useEffect(() => {
    // Lắng nghe socket để:
    // - refresh danh sách ticket khi có update
    // - nếu ticket đang mở bị update thì refresh detail (không bật loading)
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
        isSelectedTicketLoading,
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
