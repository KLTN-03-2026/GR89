import express from 'express'
import { NotificationController } from '../controllers/notification.controller'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'

const router = express.Router()

/*============================ NGƯỜI DÙNG ============================*/
router.get('/', authenticateTokenUser, requireRole(['user']), NotificationController.getMyNotifications)
router.get('/unread-count', authenticateTokenUser, requireRole(['user']), NotificationController.getMyUnreadCount)
router.patch('/:id/read', authenticateTokenUser, requireRole(['user']), NotificationController.markMyNotificationRead)
router.patch('/read-all', authenticateTokenUser, requireRole(['user']), NotificationController.markAllMyNotificationsRead)
router.delete('/:id', authenticateTokenUser, requireRole(['user']), NotificationController.deleteMyNotification)

/*============================ ADMIN/CONTENT ============================*/
router.get('/admin', authenticateTokenAdmin, requireRole(['admin', 'content']), NotificationController.getMyNotifications)
router.get('/admin/unread-count', authenticateTokenAdmin, requireRole(['admin', 'content']), NotificationController.getMyUnreadCount)
router.patch('/admin/:id/read', authenticateTokenAdmin, requireRole(['admin', 'content']), NotificationController.markMyNotificationRead)
router.patch('/admin/read-all', authenticateTokenAdmin, requireRole(['admin', 'content']), NotificationController.markAllMyNotificationsRead)
router.delete('/admin/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), NotificationController.deleteMyNotification)

export const notificationRoutes = router

