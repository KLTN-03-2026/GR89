import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import { ChatbotService } from '../services/chatbot.service'
import { AIProvider } from '../providers/ai.provider'
import OpenAI from 'openai'
import ErrorHandler from '../utils/ErrorHandler'

export class ChatbotAIController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // LẤY SYSTEM PROMPT CHO AI
  static getPrompt = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    const { lessonId, lessonType } = req.query

    if (!userId) {
      return next(new ErrorHandler('User not authenticated', 401))
    }

    // Build system prompt từ userId và lessonId/lessonType (nếu có)
    const systemPrompt = await ChatbotService.buildSystemPrompt(
      userId,
      lessonId as string | undefined,
      lessonType as 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa' | undefined
    )

    res.status(200).json({
      success: true,
      data: systemPrompt,
    })
  })

  /**
   * CHAT VỚI AI CHATBOT
   * Body: { message, conversationHistory?, lessonId?, lessonType? }
   */
  static chat = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { message, conversationHistory, lessonId, lessonType } = req.body
    const userId = req.user?._id as string

    if (!message || typeof message !== 'string') {
      return next(new ErrorHandler('Message is required', 400))
    }

    if (!userId) {
      return next(new ErrorHandler('User not authenticated', 401))
    }

    try {
      // Build system prompt mỗi lần gọi (không lấy từ client)
      const systemPrompt = await ChatbotService.buildSystemPrompt(
        userId,
        lessonId as string | undefined,
        lessonType as 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa' | undefined
      )

      // Build messages array
      const history = Array.isArray(conversationHistory) ? conversationHistory : []
      const limitedHistory = history.slice(-20) // keep last 20 turns (user/assistant)

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...limitedHistory,
        { role: 'user', content: message }
      ]

      // Call AI
      const response = await AIProvider.chatbotAi(messages)

      res.status(200).json({
        success: true,
        data: response
      })
    } catch (error: any) {
      console.error('Chatbot AI error:', error)
      return next(new ErrorHandler(error.message || 'Lỗi khi chat với AI', 500))
    }
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
}
