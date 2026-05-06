import express from 'express'
import { authRoutes } from './auth.routes'
import { vocabularyRoutes } from './vocablulary.routes'
import { MediaRoutes } from './media.routes'
import { quizRoutes } from './quiz.routes'
import { writingRoutes } from './writing.routes'
import { grammarRoutes } from './grammar.routes'
import { ipaRoutes } from './ipa.routes'
import { ReadingRoutes } from './reading.routes'
import { listeningRoutes } from './listening.routes'
import { speakingRoutes } from './speaking.routes'
import { entertainmentRoutes } from './entertainment.routes'
import { userRoutes } from './user.routes'
import { userScoreRoutes } from './userScore.routes'
import { adminRoutes } from './admin.routes'
import { planRoutes } from './plan.routes'
import { paymentRoutes } from './payment.routes'
import { couponRoutes } from './coupon.routes'
import { chatbotRoutes } from './chatbot.routes'
import { roadmapRoutes } from './roadmap.routes'
import { reportRoutes } from './report.routes'
import { dailySuggestionRoutes } from './dailySuggestion.routes'
import { globalDocumentRoutes } from './globalDocument.routes'
import { centerClassRoutes } from './centerClass.routes'
import { supportChatRoutes } from './supportChat.routes'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/vocabulary', vocabularyRoutes)
router.use('/media', MediaRoutes)
router.use('/quiz', quizRoutes)
router.use('/writing', writingRoutes)
router.use('/grammar', grammarRoutes)
router.use('/ipa', ipaRoutes)
router.use('/reading', ReadingRoutes)
router.use('/listening', listeningRoutes)
router.use('/speaking', speakingRoutes)
router.use('/speaking-scoring', speakingRoutes)
router.use('/entertainment', entertainmentRoutes)
router.use('/user', userRoutes)
router.use('/user-scores', userScoreRoutes)
router.use('/admin', adminRoutes)
router.use('/plan', planRoutes)
router.use('/payment', paymentRoutes)
router.use('/coupon', couponRoutes)
router.use('/chatbot', chatbotRoutes)
router.use('/roadmap', roadmapRoutes)
router.use('/report', reportRoutes)
router.use('/daily-suggestion', dailySuggestionRoutes)
router.use('/global-documents', globalDocumentRoutes)
router.use('/center-classes', centerClassRoutes)
router.use('/support-chat', supportChatRoutes)

// ✅ ROOT ENDPOINT
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chào mừng đến với ActiveLearning API! 🎓',
    documentation: req.protocol + '://' + req.get('host') + '/api',
    health: req.protocol + '://' + req.get('host') + '/health',
  })
})

export const mainRouter = router
