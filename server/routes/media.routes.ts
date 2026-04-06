import express from 'express'
import { upload, uploadSubtitle } from '../middleware/upload.middleware'
import { MediaController } from '../controllers/media.controller'
import { authenticateTokenAdmin, requireRole } from '../middleware/auth.middleware'
const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

// LẤY DANH SÁCH MEDIA
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.getMediaList)

// LẤY MEDIA THEO ID
router.get('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.getMediaById)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

// TẢI LÊN NHIỀU MEDIA
router.post('/upload/multiple', authenticateTokenAdmin, requireRole(['admin', 'content']), upload.array('files'), MediaController.uploadMultipleMedia)

// XÓA NHIỀU MEDIA
router.delete('/', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.deleteManyMedia)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

// TẢI LÊN 1 MEDIA
router.post('/upload/single', authenticateTokenAdmin, requireRole(['admin', 'content']), upload.single('file'), MediaController.uploadMedia)

// TẢI LÊN VIDEO
router.post('/upload/video', authenticateTokenAdmin, requireRole(['admin', 'content']), upload.single('file'), MediaController.uploadMedia)

// TẢI LÊN VIDEO TỪ YOUTUBE
router.post('/upload/video/youtube', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.uploadVideoFromYoutube)

// TẢI LÊN VIDEO TỪ VIMEO
router.post('/upload/video/vimeo', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.uploadVideoFromVimeo)

// XÓA 1 MEDIA
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.deleteMedia)

// TẢI LÊN FILE SUBTITLE
router.post('/upload/subtitle', authenticateTokenAdmin, requireRole(['admin', 'content']), uploadSubtitle.single('file'), MediaController.uploadSubtitleFile)

// CẬP NHẬT SUBTITLE CHO MEDIA
router.put('/:mediaId/subtitle', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.updateMediaSubtitle)

// XÓA SUBTITLE KHỎI MEDIA
router.delete('/:mediaId/subtitle', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.removeMediaSubtitle)

// CẬP NHẬT TIÊU ĐỀ MEDIA
router.patch('/:id/title', authenticateTokenAdmin, requireRole(['admin', 'content']), MediaController.updateMediaTitle)

export const MediaRoutes = router
