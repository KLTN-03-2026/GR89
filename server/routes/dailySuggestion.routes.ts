import express from 'express';
import { authenticateTokenUser, requireRole } from '../middleware/auth.middleware';
import { DailySuggestionController } from '../controllers/dailySuggestion.controller';

const router = express.Router();

/*============================ NGƯỜI DÙNG ============================*/

// (USER) Lấy gợi ý học tập trong ngày
router.get('/today', authenticateTokenUser, requireRole(['user', 'content', 'admin']), DailySuggestionController.getTodaySuggestion);

export const dailySuggestionRoutes = router;
