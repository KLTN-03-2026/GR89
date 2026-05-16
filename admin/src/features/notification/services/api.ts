import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import type { AdminNotification, NotificationPagination } from '../types'

export async function getAdminNotifications(params?: {
  page?: number
  limit?: number
  unread?: boolean
}): Promise<{ success: boolean; data: AdminNotification[]; pagination: NotificationPagination }> {
  const res = await AuthorizedAxios.get<{
    success: boolean
    data: AdminNotification[]
    pagination: NotificationPagination
  }>('/notifications/admin', { params })
  return res.data as unknown as { success: boolean; data: AdminNotification[]; pagination: NotificationPagination }
}

export async function getAdminUnreadCount(): Promise<number> {
  const res = await AuthorizedAxios.get<{ success: boolean; data: { unreadCount: number } }>(
    '/notifications/admin/unread-count',
  )
  return res.data.data?.unreadCount || 0
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await AuthorizedAxios.patch(`/notifications/admin/${id}/read`)
}

export async function markAllAdminNotificationsRead(): Promise<number> {
  const res = await AuthorizedAxios.patch<{ success: boolean; data?: { modified?: number } }>(
    '/notifications/admin/read-all',
  )
  return res.data.data?.modified || 0
}
