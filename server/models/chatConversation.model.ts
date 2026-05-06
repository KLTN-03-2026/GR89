import mongoose, { Document, Schema } from 'mongoose'

export type SupportTicketStatus = 'open' | 'closed'
export type SupportTicketWaitingFor = 'assignee' | 'requester'
export type SupportMessageType = 'text' | 'system'
export type SupportAttachmentType = 'image' | 'file'

export interface ISupportAttachment {
  // Loại file
  type: SupportAttachmentType
  // URL file
  url: string
  // Tên hiển thị
  name?: string
  // Kích thước (bytes)
  size?: number | null
  // MIME type
  mimeType?: string
}

export interface ISupportReadReceipt {
  // User đã đọc
  user: mongoose.Types.ObjectId
  // Thời điểm đọc
  readAt: Date
}

export interface ISupportMessage {
  // Người gửi
  sender: mongoose.Types.ObjectId
  // Loại message
  type: SupportMessageType
  // Nội dung text
  content: string
  // File đính kèm
  attachments: ISupportAttachment[]
  // Danh sách người đã đọc
  readBy: ISupportReadReceipt[]
  // Thời điểm gửi
  createdAt: Date
}

// Ticket/Support conversation:
// - Học viên tạo ticket để hỏi bài/hỗ trợ
// - Admin/Content (giáo viên/nhân sự trực) nhận ticket để trả lời
// - messages lưu trực tiếp trong conversation (array) để đọc nhanh lịch sử 1 ticket
export interface IChatConversation extends Document {
  // Học viên tạo ticket
  requester: mongoose.Types.ObjectId

  // Tiêu đề ticket
  title: string

  // Trạng thái ticket
  status: SupportTicketStatus

  // Đang chờ ai phản hồi
  waitingFor: SupportTicketWaitingFor

  // Người đang trực xử lý (có thể null nếu chưa có ai nhận)
  assignedTo?: mongoose.Types.ObjectId | null
  // Thời điểm assign gần nhất
  assignedAt?: Date | null

  // Lần cuối học viên gửi tin
  lastRequesterMessageAt?: Date | null
  // Lần cuối người trực gửi tin
  lastAssigneeMessageAt?: Date | null

  // Học viên đọc lần cuối lúc nào (để tính unread phía học viên)
  requesterLastReadAt?: Date | null
  // Người trực (assignedTo hiện tại) đọc lần cuối lúc nào
  assigneeLastReadAt?: Date | null

  // Thời điểm có tin nhắn mới nhất (để sort nhanh)
  lastMessageAt?: Date | null
  // Preview tin nhắn mới nhất (để list nhanh)
  lastMessagePreview?: string

  // Danh sách tin nhắn của ticket
  messages: ISupportMessage[]
}

const supportAttachmentSchema = new Schema<ISupportAttachment>(
  {
    type: { type: String, enum: ['image', 'file'], required: true },
    url: { type: String, required: true },
    name: { type: String, default: '' },
    size: { type: Number, default: null },
    mimeType: { type: String, default: '' },
  },
  { _id: false },
)

const supportReadReceiptSchema = new Schema<ISupportReadReceipt>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'system'], default: 'text' },
    content: { type: String, default: '' },
    attachments: { type: [supportAttachmentSchema], default: [] },
    readBy: { type: [supportReadReceiptSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const chatConversationSchema = new Schema<IChatConversation>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    waitingFor: { type: String, enum: ['assignee', 'requester'], default: 'assignee', index: true },

    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedAt: { type: Date, default: null },

    lastRequesterMessageAt: { type: Date, default: null, index: true },
    lastAssigneeMessageAt: { type: Date, default: null, index: true },

    // Học viên đọc lần cuối lúc nào (để tính unread phía học viên)
    requesterLastReadAt: { type: Date, default: null },
    // Người trực (assignedTo hiện tại) đọc lần cuối lúc nào
    assigneeLastReadAt: { type: Date, default: null },

    // Thời điểm có tin nhắn mới nhất (để sort nhanh)
    lastMessageAt: { type: Date, default: null, index: true },
    // Preview tin nhắn mới nhất (để list nhanh)
    lastMessagePreview: { type: String, default: '' },

    messages: { type: [supportMessageSchema], default: [] },
  },
  { timestamps: true },
)

chatConversationSchema.index({ status: 1, waitingFor: 1, lastMessageAt: -1 })
chatConversationSchema.index({ requester: 1, lastMessageAt: -1 })

export const ChatConversation =
  mongoose.models.ChatConversation ||
  mongoose.model<IChatConversation>('ChatConversation', chatConversationSchema)
