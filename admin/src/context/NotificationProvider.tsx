'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { useSocketStore } from '@/hooks/useSocketStore'
import { useAuth } from '@/context/AuthContext'

export interface AdminNotification {
  _id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  items: AdminNotification[]
  unreadCount: number
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const socket = useSocketStore((s) => s.socket)
  const pathname = usePathname()

  const [items, setItems] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0)
      return
    }
    const res = await AuthorizedAxios.get<{ success: boolean; data: { unreadCount: number } }>(
      '/notifications/admin/unread-count',
    )
    setUnreadCount(res.data.data?.unreadCount || 0)
  }, [user?._id])

  const refreshRecent = useCallback(async () => {
    if (!user?._id) {
      setItems([])
      return
    }
    const res = await AuthorizedAxios.get<{ success: boolean; data: AdminNotification[] }>('/notifications/admin', {
      params: { page: 1, limit: 10 },
    })
    setItems(res.data.data || [])
  }, [user?._id])

  const refresh = useCallback(async () => {
    await Promise.all([refreshUnreadCount(), refreshRecent()])
  }, [refreshUnreadCount, refreshRecent])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!socket) return

    const playSound = () => {
      audioRef.current?.play().catch(() => {})
    }

    const onNew = (payload: any) => {
      if (!payload?._id) return

      const next: AdminNotification = {
        _id: String(payload._id),
        type: String(payload.type || 'system'),
        title: String(payload.title || ''),
        body: String(payload.body || ''),
        link: payload.link ? String(payload.link) : '',
        isRead: false,
        createdAt: payload.createdAt ? String(payload.createdAt) : new Date().toISOString(),
      }

      setUnreadCount((prev) => prev + 1)
      setItems((prev) => [next, ...prev].slice(0, 10))

      const isNotificationsArea = pathname.includes('/communications') || pathname.includes('/notifications')
      if (!isNotificationsArea) playSound()
    }

    socket.on('notification:new', onNew)
    return () => {
      socket.off('notification:new', onNew)
    }
  }, [socket, pathname])

  const markRead = useCallback(async (id: string) => {
    await AuthorizedAxios.patch(`/notifications/admin/${id}/read`)
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await AuthorizedAxios.patch('/notifications/admin/read-all')
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    await refreshUnreadCount()
  }, [refreshUnreadCount])

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, refresh, markRead, markAllRead],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

