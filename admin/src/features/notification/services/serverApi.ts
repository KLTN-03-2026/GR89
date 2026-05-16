import { fetchServer } from '@/lib/apis/fetch-server'
import type { AdminNotification, NotificationPagination } from '../types'

export async function getAdminNotificationsServer(params?: {
  page?: number
  limit?: number
  unread?: boolean
}): Promise<{ data: AdminNotification[]; pagination: NotificationPagination }> {
  const query = new URLSearchParams()
  if (params?.page != null) query.set('page', String(params.page))
  if (params?.limit != null) query.set('limit', String(params.limit))
  if (params?.unread) query.set('unread', 'true')

  const res = await fetchServer<AdminNotification[]>(`/notifications/admin?${query.toString()}`)

  return {
    data: res.data || [],
    pagination: {
      page: res.pagination?.page || params?.page || 1,
      limit: res.pagination?.limit || params?.limit || 20,
      total: res.pagination?.total || 0,
      pages: res.pagination?.pages || 1,
    }
  }
}
