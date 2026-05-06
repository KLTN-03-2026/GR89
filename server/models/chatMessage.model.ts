import mongoose, { Document, Schema } from 'mongoose'

export type ChatMessageType = 'text' | 'system'
export type ChatAttachmentType = 'image' | 'file'

export interface IChatAttachment {
  type: ChatAttachmentType
  url: string
  name?: string
  size?: number
  mimeType?: string
}

export interface IChatReadReceipt {
  user: mongoose.Types.ObjectId
  readAt: Date
}

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: ChatMessageType
  content: string
  attachments: IChatAttachment[]
  readBy: IChatReadReceipt[]
  createdAt: Date
}

const chatAttachmentSchema = new Schema<IChatAttachment>(
  {
    // Loại file
    type: { type: String, enum: ['image', 'file'], required: true },
    // URL file
    url: { type: String, required: true },
    // Tên hiển thị
    name: { type: String, default: '' },
    // Kích thước (bytes)
    size: { type: Number, default: null },
    // MIME type
    mimeType: { type: String, default: '' },
  },
  { _id: false },
)

const chatReadReceiptSchema = new Schema<IChatReadReceipt>(
  {
    // User đã đọc
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Thời điểm đọc
    readAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const chatMessageSchema = new Schema<IChatMessage>(
  {
    // Thuộc conversation nào
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    // Người gửi
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Loại message
    type: { type: String, enum: ['text', 'system'], default: 'text', index: true },
    // Nội dung text
    content: { type: String, default: '' },
    // File đính kèm
    attachments: { type: [chatAttachmentSchema], default: [] },
    // Danh sách người đã đọc
    readBy: { type: [chatReadReceiptSchema], default: [] },
  },
  { timestamps: true },
)

chatMessageSchema.index({ conversationId: 1, createdAt: -1 })

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)
