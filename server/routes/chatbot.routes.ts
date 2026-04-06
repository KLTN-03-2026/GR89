import express from 'express'
import { authenticateTokenUser, requireRole } from '../middleware/auth.middleware'
import { ChatbotAIController } from '../controllers/chatbotAI.controller'

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

// LẤY SYSTEM PROMPT CHO AI
router.get('/prompt', authenticateTokenUser, requireRole(['user']), ChatbotAIController.getPrompt)

// CHAT VỚI AI CHATBOT
router.post('/chat', authenticateTokenUser, requireRole(['user']), ChatbotAIController.chat)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

export const chatbotRoutes = router
