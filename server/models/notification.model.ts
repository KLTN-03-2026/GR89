import mongoose, { Document, Schema } from 'mongoose'

export type NotificationAudienceRole = 'user' | 'admin' | 'content'
export type NotificationType = 'system' | 'support' | 'homework' | 'payment' | 'media' | 'lesson'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  recipientRole: NotificationAudienceRole
  type: NotificationType
  title: string
  body: string
  link?: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: { type: String, enum: ['user', 'admin', 'content'], required: true, index: true },
    type: {
      type: String,
      enum: ['system', 'support', 'homework', 'payment', 'media', 'lesson'],
      default: 'system',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },
    link: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema)

