import express from 'express'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { EntertainmentController } from '../controllers/entertainment.controller'
import { uploadDocument } from '../middleware/upload.middleware'
import { checkVipContentUser } from '../middleware/content.middleware'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.exportEntertainmentData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.importEntertainmentJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.getOverviewStats)
router.get('/user/stats', authenticateTokenUser, EntertainmentController.getStatsForUser)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.getAllPaginated)
router.put('/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.updateMultipleEntertainmentStatus)
router.delete('/bulk-delete', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.deleteMany)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

router.get('/user/list', authenticateTokenUser, EntertainmentController.getForUser)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('entertainment'), EntertainmentController.getForUserDetail)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

router.post('/', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.create)
router.get('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.getById)
router.put('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.update)
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.delete)
router.patch('/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.toggleStatus)
router.patch('/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), EntertainmentController.toggleVipStatus)

export const entertainmentRoutes = router


