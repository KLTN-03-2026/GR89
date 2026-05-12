import { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/ErrorHandler'
import { NotificationService } from '../services/notification.service'
import { CatchAsyncError } from '../middleware/CatchAsyncError'

export class NotificationController {
  static getMyNotifications = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const { page, limit, unread } = req.query as {
        page?: string
        limit?: string
        unread?: string
      }
      const result = await NotificationService.list({
        recipientId: String(userId),
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        unreadOnly: unread === 'true',
      })

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách thông báo thành công',
        data: result.data,
        pagination: result.pagination,
      })
    },
  )

  static getMyUnreadCount = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const count = await NotificationService.unreadCount(String(userId))
      res.status(200).json({
        success: true,
        message: 'Lấy số thông báo chưa đọc thành công',
        data: { unreadCount: count },
      })
    },
  )

  static markMyNotificationRead = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const { id } = req.params as { id: string }
      const ok = await NotificationService.markRead(String(userId), id)
      if (!ok) return next(new ErrorHandler('Không tìm thấy thông báo', 404))

      res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc' })
    },
  )

  static markAllMyNotificationsRead = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const modified = await NotificationService.markAllRead(String(userId))
      res
        .status(200)
        .json({ success: true, message: 'Đã đánh dấu tất cả đã đọc', data: { modified } })
    },
  )

  static deleteMyNotification = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const { id } = req.params as { id: string }
      const ok = await NotificationService.remove(String(userId), id)
      if (!ok) return next(new ErrorHandler('Không tìm thấy thông báo', 404))

      res.status(200).json({ success: true, message: 'Đã xóa thông báo' })
    },
  )
}
