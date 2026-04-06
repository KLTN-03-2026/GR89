import express from 'express'
import { UserScoreController } from '../controllers/userScore.controller'
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from '../middleware/auth.middleware'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

// (ADMIN) Lấy thống kê tổng quan về điểm số của tất cả người dùng
router.get('/stats', authenticateTokenAdmin, requireRole(['admin', 'content']), UserScoreController.getStats)

// (ADMIN) Lấy phân tích kỹ năng trung bình của tất cả người dùng
router.get('/skills', authenticateTokenAdmin, requireRole(['admin', 'content']), UserScoreController.getSkillAnalysis)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

// (ADMIN) Lấy danh sách điểm số người dùng (có phân trang & tìm kiếm)
router.get('/', authenticateTokenAdmin, requireRole(['admin', 'content']), UserScoreController.getAllUserScores)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

// (USER) Lấy danh sách người dùng có điểm số cao nhất (Bảng xếp hạng)
router.get('/top', authenticateTokenUser, requireRole(['user']), UserScoreController.getTopUsers)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

// (ADMIN) Lấy chi tiết điểm số của một người dùng theo ID
router.get('/:userId', authenticateTokenAdmin, requireRole(['admin', 'content']), UserScoreController.getUserScoreById)

// (ADMIN) Đồng bộ và cập nhật điểm số cho một người dùng
router.put('/:userId', authenticateTokenAdmin, requireRole(['admin', 'content']), UserScoreController.createOrUpdateUserScore)

export const userScoreRoutes = router
