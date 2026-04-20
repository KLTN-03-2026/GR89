import express from 'express';
import { SpeakingController } from '../controllers/speaking.controller';
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware';
import { uploadMemory, handleUploadError, uploadDocument } from '../middleware/upload.middleware'
import { checkVipContentUser } from '../middleware/content.middleware';

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.exportSpeakingData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.importSpeakingJson)
router.get('/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.getOverviewStats)
router.get('/stats/overview', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.getSpeakingStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/admin', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.getAllSpeaking)
router.put('/admin/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.updateMultipleSpeakingStatus)
router.delete('/admin/multiple', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.deleteMultipleSpeaking)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/
router.get('/user', authenticateTokenUser, SpeakingController.getSpeakingByUser)

router.post(
  '/users/:lessonId/save-highest-score',
  authenticateTokenUser,
  SpeakingController.saveHighestSpeakingScore
)
router.get(
  '/user/:id/result',
  authenticateTokenUser,
  checkVipContentUser('speaking'),
  SpeakingController.getSpeakingResult
)
router.get('/user/:id', authenticateTokenUser, checkVipContentUser('speaking'), SpeakingController.getSpeakingByIdForUser)
router.post('/assess-pronunciation', authenticateTokenUser, uploadMemory.single('audio'), handleUploadError, SpeakingController.assessPronunciationSpeaking)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.post('/admin', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.createSpeaking)
router.get('/admin/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.getSpeakingById)
router.put('/admin/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.updateSpeaking)
router.delete('/admin/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.deleteSpeaking)
router.put('/admin/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.updateSpeakingStatus)
router.patch('/admin/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.toggleVipStatus)
router.patch('/admin/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), SpeakingController.swapOrderIndex)

export const speakingRoutes = router;
