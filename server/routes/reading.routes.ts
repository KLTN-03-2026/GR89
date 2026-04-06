import express from 'express'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { ReadingController } from '../controllers/reading.controller'
import { checkVipContentUser } from '../middleware/content.middleware'
import { uploadDocument } from '../middleware/upload.middleware'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.exportReadingData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.importReadingJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.getOverviewStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.getAllReadingPaginated)
router.put('/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.updateMultipleReadingStatus)
router.delete('/delete-multiple', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.deleteMultipleReading)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/
router.get('/user', authenticateTokenUser, requireRole(['user']), ReadingController.getReadingByUser)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('reading'), ReadingController.getReadingById)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.post('/create', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.createReading)
router.get('/:id', ReadingController.getReadingById)
router.put('/update/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.updateReading)
router.delete('/delete/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.deleteReading)
router.put('/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.updateReadingStatus)
router.patch('/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.toggleVipStatus)
router.patch('/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.swapOrderIndex)

/*============================ QUẢN TRỊ - QUIZ & TỪ VỰNG ============================*/
router.post('/create-quiz/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.createQuiz)
router.delete('/delete-quiz/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.deleteQuiz)
router.post('/create-vocabulary/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.createVocabulary)
router.put('/update-vocabulary/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.updateVocabulary)
router.delete('/delete-vocabulary/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), ReadingController.deleteVocabulary)

/*============================ THAO TÁC NGƯỜI DÙNG TRÊN BÀI ĐỌC ============================*/
router.get('/:id/quiz', authenticateTokenUser, requireRole(['user']), checkVipContentUser('reading'), ReadingController.getQuizByReading)
router.post('/:id/do', authenticateTokenUser, requireRole(['user']), checkVipContentUser('reading'), ReadingController.doReadingQuiz)
router.get('/:id/result', authenticateTokenUser, requireRole(['user']), checkVipContentUser('reading'), ReadingController.getReadingResult)

export const ReadingRoutes = router
