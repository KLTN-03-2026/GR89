import express from 'express'
import { IpaController } from '../controllers/ipa.controller'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { uploadMemory, handleUploadError, uploadDocument } from '../middleware/upload.middleware'
import { checkVipContentUser } from '../middleware/content.middleware'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.exportIpaData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.importIpaJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.getOverviewStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.getAllIpa)
router.put('/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.updateManyIpaStatus)
router.post('/delete-many', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.deleteManyIpa)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/
router.get('/user', authenticateTokenUser, IpaController.getIpaByUser)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('ipa'), IpaController.getIpaById)
router.post('/assess-pronunciation', authenticateTokenUser, uploadMemory.single('audio'), handleUploadError, IpaController.assessPronunciationIpa)
router.post('/users/save-highest-score/:lessonId', authenticateTokenUser, IpaController.saveHighestScore)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.post('/', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.createIpa)
router.get('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.getIpaById)
router.put('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.updateIpa)
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.deleteIpa)
router.put('/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.updateIpaStatus)
router.patch('/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.toggleVipStatus)
router.patch('/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.swapOrderIndex)

/*============================ QUẢN TRỊ - VÍ DỤ (EXAMPLES) ============================*/
router.post('/:id/example', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.addExampleIpa)
router.put('/:id/example', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.updateExampleIpa)
router.delete('/:id/example', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.deleteExampleIpa)
router.delete('/:id/examples', authenticateTokenAdmin, requireRole(['admin', 'content']), IpaController.deleteManyExamplesIpa)

export const ipaRoutes = router
