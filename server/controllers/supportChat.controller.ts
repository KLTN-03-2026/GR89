import { NextFunction, Request, Response } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'
import { SupportChatService } from '../services/supportChat.service'
import { io } from '../socket'
import { NotificationService } from '../services/notification.service'
import { MediaService } from '../services/media.service'

export class SupportChatController {
  static uploadAttachmentForUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
      if (!req.file) return next(new ErrorHandler('Vui lòng tải lên file', 400))

      const { url } = await MediaService.uploadRawFile(req.file.path, 'english-chat')
      const mimeType = req.file.mimetype || ''
      const type = mimeType.startsWith('image/') ? 'image' : 'file'

      res.status(201).json({
        success: true,
        message: 'Upload file thành công',
        data: {
          type,
          url,
          name: req.file.originalname,
          size: req.file.size,
          mimeType,
        },
      })
    },
  )

  static uploadAttachmentForStaff = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const staffId = req.user?._id as string
      if (!staffId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
      if (!req.file) return next(new ErrorHandler('Vui lòng tải lên file', 400))

      const { url } = await MediaService.uploadRawFile(req.file.path, 'english-chat')
      const mimeType = req.file.mimetype || ''
      const type = mimeType.startsWith('image/') ? 'image' : 'file'

      res.status(201).json({
        success: true,
        message: 'Upload file thành công',
        data: {
          type,
          url,
          name: req.file.originalname,
          size: req.file.size,
          mimeType,
        },
      })
    },
  )

  /*============================ NGƯỜI DÙNG ============================*/

  // (USER) Lấy chi tiết ticket
  static getTicketDetailForUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const ticket = await SupportChatService.getTicketByIdForUser(userId)
      res.status(200).json({
        success: true,
        message: 'Lấy chi tiết ticket thành công',
        data: ticket,
      })
    },
  )

  // (USER) Gửi tin nhắn
  static sendMessageForUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const { content, attachments } = req.body

      const ticket = await SupportChatService.sendMessageAsRequester(userId, content, attachments)

      io.to(`ticket:${String(ticket._id)}`).emit('message:new', { ticketId: String(ticket._id) })
      io.to('staff').emit('ticket:updated', { ticketId: String(ticket._id) })

      if (!ticket.assignedToId && ticket.status === 'assigned') {
        const plain = String(content || '').trim()
        await NotificationService.createForRoles({
          roles: ['admin', 'content'],
          type: 'support',
          title: 'Tin nhắn hỗ trợ mới',
          body: plain
            ? plain.length > 120
              ? `${plain.slice(0, 117)}...`
              : plain
            : 'Học viên đã gửi một tin nhắn mới',
          link: `/center-management/support`,
          data: { ticketId: String(ticket._id) },
        })
      }

      res.status(200).json({
        success: true,
        message: 'Gửi tin nhắn thành công',
        data: ticket,
      })
    },
  )

  // (USER) Đọc tất cả tin nhắn chưa phản hồi
  static getUnreadCountForUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const ticket = await SupportChatService.getUnreadCountForUser(userId)

      io.to(`ticket:${String(ticket._id)}`).emit('message:readAll', {
        ticketId: String(ticket._id),
      })
      io.to('staff').emit('ticket:updated', { ticketId: String(ticket._id) })

      res.status(200).json({
        success: true,
        message: 'Đọc tất cả tin nhắn chưa phản hồi thành công',
        data: ticket,
      })
    },
  )

  /*============================ ADMIN/CONTENT ============================*/

  // (ADMIN/CONTENT) Danh sách ticket để xử lý
  static getTicketsForStaff = CatchAsyncError(async (req: Request, res: Response) => {
    const { status, waitingFor, assigned } = req.query
    const tickets = await SupportChatService.getTicketsForStaff({
      status: status as any,
      waitingFor: waitingFor as any,
      assigned: assigned as any,
    })

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách ticket thành công',
      data: tickets,
    })
  })

  // (ADMIN/CONTENT) Lấy chi tiết ticket
  static getTicketDetailForStaff = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const ticket = await SupportChatService.getTicketByIdForStaff(id)
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết ticket thành công',
      data: ticket,
    })
  })

  // (ADMIN/CONTENT) Nhận ticket / cướp quyền
  static claimTicket = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const staffId = req.user?._id as string
    if (!staffId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    const { id } = req.params
    const { takeoverMinutes } = req.body
    const ticket = await SupportChatService.claimTicket(id, staffId, Number(takeoverMinutes) || 5)

    io.to(`ticket:${String(ticket._id)}`).emit('ticket:claimed', {
      ticketId: String(ticket._id),
      assignedTo: String(ticket.assignedTo || ''),
    })
    io.to('staff').emit('ticket:updated', { ticketId: String(ticket._id) })

    res.status(200).json({
      success: true,
      message: 'Nhận ticket thành công',
      data: ticket,
    })
  })

  // (ADMIN/CONTENT) Gửi tin nhắn
  static sendMessageForStaff = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const staffId = req.user?._id as string
      if (!staffId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

      const { id } = req.params
      const { content, attachments } = req.body

      const ticket = await SupportChatService.sendMessageAsStaff(id, staffId, content, attachments)

      io.to(`ticket:${String(ticket._id)}`).emit('message:new', { ticketId: String(ticket._id) })
      io.to('staff').emit('ticket:updated', { ticketId: String(ticket._id) })
      io.to(`user:${String(ticket.requester)}`).emit('ticket:updated', {
        ticketId: String(ticket._id),
      })

      res.status(200).json({
        success: true,
        message: 'Gửi tin nhắn thành công',
        data: ticket,
      })
    },
  )

  // (ADMIN/CONTENT) Mở nhận quyên ticket
  static openClaimTicket = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
      const ticket = await SupportChatService.openClaimTicket(userId)

      res.status(200).json({
        success: true,
        message: 'Mở nhận ticket thành công',
        data: ticket,
      })
    },
  )
}
