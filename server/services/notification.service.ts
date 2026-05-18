import mongoose from 'mongoose'
import {
  Notification,
  type INotification,
  type NotificationType,
  type NotificationAudienceRole,
} from '../models/notification.model'
import { User } from '../models/user.model'
import { io } from '../socket'

type CreateNotificationInput = {
  recipientId: string
  recipientRole: NotificationAudienceRole
  type: NotificationType
  title: string
  body?: string
  link?: string
  data?: Record<string, any>
}

export class NotificationService {
  static async createOne(input: CreateNotificationInput): Promise<INotification> {
    const doc = await Notification.create({
      recipient: new mongoose.Types.ObjectId(input.recipientId),
      recipientRole: input.recipientRole,
      type: input.type,
      title: input.title,
      body: input.body || '',
      link: input.link || '',
      data: input.data || {},
    })

    io.to(`user:${input.recipientId}`).emit('notification:new', {
      _id: String(doc._id),
      type: doc.type,
      title: doc.title,
      body: doc.body,
      link: doc.link,
      data: doc.data || {},
      createdAt: doc.createdAt,
    })

    return doc
  }

  static async createForUsers(params: {
    userIds: string[]
    type: NotificationType
    title: string
    body?: string
    link?: string
    data?: Record<string, any>
  }): Promise<void> {
    const uniqueUserIds = Array.from(new Set((params.userIds || []).filter(Boolean)))
    if (!uniqueUserIds.length) return

    const docs = uniqueUserIds.map((userId) => ({
      recipient: new mongoose.Types.ObjectId(userId),
      recipientRole: 'user' as const,
      type: params.type,
      title: params.title,
      body: params.body || '',
      link: params.link || '',
      data: params.data || {},
      isRead: false,
      readAt: null,
    }))

    const created = await Notification.insertMany(docs, { ordered: false })
    created.forEach((n) => {
      io.to(`user:${String(n.recipient)}`).emit('notification:new', {
        _id: String(n._id),
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        data: (n as any).data || {},
        createdAt: n.createdAt,
      })
    })
  }

  static async createForRoles(params: {
    roles: NotificationAudienceRole[]
    type: NotificationType
    title: string
    body?: string
    link?: string
    data?: Record<string, any>
  }): Promise<void> {
    const users = await User.find({ role: { $in: params.roles }, isActive: true }).select(
      '_id role',
    )
    if (!users.length) return

    const docs = users.map((u) => ({
      recipient: u._id,
      recipientRole: u.role as NotificationAudienceRole,
      type: params.type,
      title: params.title,
      body: params.body || '',
      link: params.link || '',
      data: params.data || {},
      isRead: false,
      readAt: null,
    }))

    const created = await Notification.insertMany(docs, { ordered: false })

    created.forEach((n) => {
      io.to(`user:${String(n.recipient)}`).emit('notification:new', {
        _id: String(n._id),
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        data: (n as any).data || {},
        createdAt: n.createdAt,
      })
    })
  }

  static async list(params: {
    recipientId: string
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<{
    data: INotification[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }> {
    const page = Math.max(1, Number(params.page || 1))
    const limit = Math.min(50, Math.max(1, Number(params.limit || 20)))
    const query: any = { recipient: new mongoose.Types.ObjectId(params.recipientId) }
    if (params.unreadOnly) query.isRead = false

    const [total, list] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ])

    return {
      data: list as any,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    }
  }

  static async unreadCount(recipientId: string): Promise<number> {
    return Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(recipientId),
      isRead: false,
    })
  }

  static async markRead(recipientId: string, notificationId: string): Promise<boolean> {
    const res = await Notification.updateOne(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        recipient: new mongoose.Types.ObjectId(recipientId),
      },
      { $set: { isRead: true, readAt: new Date() } },
    )
    return res.modifiedCount > 0
  }

  static async markAllRead(recipientId: string): Promise<number> {
    const res = await Notification.updateMany(
      { recipient: new mongoose.Types.ObjectId(recipientId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    )
    return res.modifiedCount || 0
  }

  static async remove(recipientId: string, notificationId: string): Promise<boolean> {
    const res = await Notification.deleteOne({
      _id: new mongoose.Types.ObjectId(notificationId),
      recipient: new mongoose.Types.ObjectId(recipientId),
    })
    return res.deletedCount > 0
  }
}
