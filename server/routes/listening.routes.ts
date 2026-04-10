import express from 'express'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { ListeningController } from '../controllers/listening.controller'
import { checkVipContentUser } from '../middleware/content.middleware'
import { uploadDocument } from '../middleware/upload.middleware'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.exportListeningData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.importListeningJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.getOverviewStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.getAllListening)
router.put('/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.updateMultipleListeningStatus)
router.delete('/', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.deleteMultipleListening)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/
router.get('/user', authenticateTokenUser, requireRole(['user']), ListeningController.getListeningList)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('listening'), ListeningController.getListeningById)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.post('/create', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.createListening)
router.get('/:id/quizzes', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.getListeningQuizzes)
router.post('/:id/quizzes', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.addListeningQuiz)
router.put('/:id/quizzes/:quizId', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.updateListeningQuizItem)
router.delete('/:id/quizzes/:quizId', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.deleteListeningQuizItem)
router.get('/:id', ListeningController.getListeningById)
router.put('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.updateListening)
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.deleteListening)
router.put('/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.updateListeningStatus)
router.patch('/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.toggleVipStatus)
router.patch('/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), ListeningController.swapOrderIndex)

/*============================ THAO TÁC NGƯỜI DÙNG TRÊN BÀI NGHE ============================*/
router.post('/do/:id', authenticateTokenUser, requireRole(['user']), checkVipContentUser('listening'), ListeningController.doListeningQuiz)
router.get('/:id/result', authenticateTokenUser, requireRole(['user']), checkVipContentUser('listening'), ListeningController.getListeningResult)

export const listeningRoutes = router
