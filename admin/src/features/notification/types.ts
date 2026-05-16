export interface AdminNotification {
  _id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationPagination {
  page: number
  limit: number
  total: number
  pages: number
}
