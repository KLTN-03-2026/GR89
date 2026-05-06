import express from 'express'
import { SupportChatController } from '../controllers/supportChat.controller'
import {
  authenticateTokenAdmin,
  authenticateTokenUser,
  requireRole,
} from '../middleware/auth.middleware'

const router = express.Router()

/*============================ NGƯỜI DÙNG ============================*/
// (USER) Chi tiết ticket
router.get(
  '/tickets',
  authenticateTokenUser,
  requireRole(['user']),
  SupportChatController.getTicketDetailForUser,
)

// (USER) Gửi tin nhắn
router.post(
  '/tickets/messages',
  authenticateTokenUser,
  requireRole(['user']),
  SupportChatController.sendMessageForUser,
)

// (USER) Lấy số lượng tin nhắn chưa phản hồi
router.get(
  '/tickets/unread-count',
  authenticateTokenUser,
  requireRole(['user']),
  SupportChatController.getUnreadCountForUser,
)

/*============================ ADMIN/CONTENT ============================*/

// (ADMIN/CONTENT) Danh sách ticket để xử lý
router.get(
  '/admin/tickets',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  SupportChatController.getTicketsForStaff,
)

// (ADMIN/CONTENT) Chi tiết ticket
router.get(
  '/admin/tickets/:id',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  SupportChatController.getTicketDetailForStaff,
)

// (ADMIN/CONTENT) Nhận ticket
router.post(
  '/admin/tickets/:id/claim',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  SupportChatController.claimTicket,
)

// (ADMIN/CONTENT) Gửi tin nhắn
router.post(
  '/admin/tickets/:id/messages',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  SupportChatController.sendMessageForStaff,
)

// (ADMIN/CONTENT) Mở nhận ticket khi offline
router.patch(
  '/admin/tickets/open-claim',
  authenticateTokenAdmin,
  requireRole(['admin', 'content']),
  SupportChatController.openClaimTicket,
)

export const supportChatRoutes = router
