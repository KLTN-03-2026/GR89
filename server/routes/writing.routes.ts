import express from "express"
import { WritingController } from "../controllers/writing.controller"
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware"
import { checkVipContentUser } from '../middleware/content.middleware'
import { uploadDocument } from "../middleware/upload.middleware"

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.exportWritingData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.importWritingJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.getOverviewStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.getAllWriting)
router.post('/create', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.createWriting)
router.put('/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.updateMultipleWritingStatus)
router.delete('/', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.deleteMultipleWriting)

/*============================ NGƯỜI DÙNG ============================*/
router.get('/user', authenticateTokenUser, requireRole(['user']), WritingController.getAllWritingByUser)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('writing'), WritingController.getWritingById)
router.get('/:id/result', authenticateTokenUser, requireRole(['user']), checkVipContentUser('writing'), WritingController.getUserProgress)
router.post('/evaluate/:id', authenticateTokenUser, requireRole(['user']), checkVipContentUser('writing'), WritingController.evaluateWriting)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.put('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.updateWriting)
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.deleteWriting)
router.put('/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.updateWritingStatus)
router.patch('/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.toggleVipStatus)
router.patch('/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), WritingController.swapOrderIndex)

export const writingRoutes = router
