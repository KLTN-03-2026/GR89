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
