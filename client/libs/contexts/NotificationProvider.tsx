'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import authorizedAxios from '@/libs/apis/authorizedAxios'
import { useAuth } from '@/libs/contexts/AuthContext'
import { useSocketStore } from '@/libs/hooks/useSocketStore'

export type NotificationType = 'system' | 'support' | 'homework' | 'payment' | 'media' | 'lesson'

export type AppNotification = {
  _id: string
  type: NotificationType
  title: string
  body: string
  link?: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  items: AppNotification[]
  unreadCount: number
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  deleteOne: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const socket = useSocketStore((s) => s.socket)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [items, setItems] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/message.mp3')
  }, [])

  const playSound = () => {
    audioRef.current?.play().catch(() => {})
  }

  const refreshUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0)
      return
    }
    const res = await authorizedAxios.get<{ success: boolean; data: { unreadCount: number } }>(
      '/notifications/unread-count',
    )
    setUnreadCount(res.data.data?.unreadCount || 0)
  }, [user?._id])

  const refreshList = useCallback(async () => {
    if (!user?._id) {
      setItems([])
      return
    }
    const res = await authorizedAxios.get<{ success: boolean; data: AppNotification[] }>('/notifications', {
      params: { page: 1, limit: 50 },
    })
    setItems(res.data.data || [])
  }, [user?._id])

  const refresh = useCallback(async () => {
    await Promise.all([refreshUnreadCount(), refreshList()])
  }, [refreshUnreadCount, refreshList])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!socket) return

    const onNew = (payload: AppNotification) => {
      if (!payload?._id) return
      const next: AppNotification = {
        _id: String(payload._id),
        type: (payload.type as NotificationType) || 'system',
        title: String(payload.title || ''),
        body: String(payload.body || ''),
        link: payload.link ? String(payload.link) : '',
        data: payload.data && typeof payload.data === 'object' ? payload.data : {},
        isRead: false,
        createdAt: payload.createdAt ? String(payload.createdAt) : new Date().toISOString(),
      }
      setItems((prev) => [next, ...prev].slice(0, 50))
      setUnreadCount((prev) => prev + 1)
      playSound()
    }

    socket.on('notification:new', onNew)
    return () => {
      socket.off('notification:new', onNew)
    }
  }, [socket])

  const markRead = useCallback(async (id: string) => {
    await authorizedAxios.patch(`/notifications/${id}/read`)
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await authorizedAxios.patch('/notifications/read-all')
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    await refreshUnreadCount()
  }, [refreshUnreadCount])

  const deleteOne = useCallback(async (id: string) => {
    await authorizedAxios.delete(`/notifications/${id}`)
    setItems((prev) => prev.filter((n) => n._id !== id))
  }, [])

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
      deleteOne,
    }),
    [items, unreadCount, refresh, markRead, markAllRead, deleteOne],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
