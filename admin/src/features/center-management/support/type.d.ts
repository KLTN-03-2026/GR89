export interface IChatItem {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  avatar: string
}

export interface IMessage {
  id: string
  senderId: 'admin' | 'user'
  content: string
  time: string
  status: 'sent' | 'seen'
  type?: 'text' | 'image' | 'file'
  fileName?: string
  fileSize?: string
  fileUrl?: string
}

export interface SupportUser {
  _id: string
  role: string
  fullName?: string
  email?: string
  avatar?: string
}

export type SupportMessageType = 'text' | 'system'
export type SupportAttachmentType = 'image' | 'file'

export interface SupportAttachment {
  type: SupportAttachmentType
  url: string
  name?: string
  size?: number | null
  mimeType?: string
}

export interface SupportMessage {
  _id: string
  sender: SupportUser
  type?: SupportMessageType
  content: string
  createdAt: string
  attachments?: SupportAttachment[]
}

export interface SupportTicket {
  _id: string
  requester: SupportUser
  assignedTo?: SupportUser | null
  title?: string
  status?: 'open' | 'closed'
  waitingFor?: 'assignee' | 'requester'
  lastMessageAt?: string | null
  lastMessagePreview?: string
  lastRequesterMessageAt?: string | null
  lastAssigneeMessageAt?: string | null
  messages?: SupportMessage[]
  unreadCount?: number
}
