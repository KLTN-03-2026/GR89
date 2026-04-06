import express from "express";
import { authenticateTokenAdmin, authenticateTokenUser, requireRole } from "../middleware/auth.middleware";
import { VocabularyController } from "../controllers/vocabulary.controller";
import { checkVipContentUser } from "../middleware/content.middleware";
import { uploadDocument } from "../middleware/upload.middleware";

const router = express.Router()

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/
router.get('/export', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.exportVocabularyData)
router.post('/import-json', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.importVocabularyJson)
router.get('/overview-admin', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.getOverviewStats)

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/
router.get('/topics-admin', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.getAllTopics)
router.post('/topics/delete-many', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.deleteManyVocabularyTopics)
router.put('/topics/bulk/status', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.updateManyVocabularyTopicsStatus)
router.post('/delete-many', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.deleteManyVocabularies)

/*============================ NGƯỜI DÙNG & CHUNG ============================*/
router.get('/topics-user', authenticateTokenUser, VocabularyController.getVocabularyListByUser)
router.get('/overview-user', authenticateTokenUser, VocabularyController.getVocabularyOverview)

// (USER) Thao tác học & làm bài theo topic
router.get('/:id/user', authenticateTokenUser, checkVipContentUser('vocabulary'), VocabularyController.getAllVocabularyByTopic)
router.post('/:id/do', authenticateTokenUser, checkVipContentUser('vocabulary'), VocabularyController.doQuizVocabulary)
router.get('/:id/quiz/user', authenticateTokenUser, checkVipContentUser('vocabulary'), VocabularyController.getQuizByVocabulary)
router.get('/:id/result', authenticateTokenUser, checkVipContentUser('vocabulary'), VocabularyController.getVocabularyResult)

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
router.post('/create-topic', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.createTopicVocabulary)
router.get('/:id/quiz', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.getAllQuizByTopic)
router.post('/:id/quiz', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.createQuizByTopic)
router.delete('/:id/quiz/:quizId', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.deleteQuizByTopic)

router.post('/create', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.createVocabulary)
router.get('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.getAllVocabularyByTopic)
router.delete('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.deleteVocabulary)
router.put('/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.updateVocabulary)

router.put('/topic/:id/status', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.updateTopicVocabularyStatus)
router.patch('/topic/:id/swap-order', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.swapOrderIndex)
router.patch('/topic/:id/vip', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.toggleTopicVipStatus)
router.delete('/topic/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.deleteTopicVocabulary)
router.put('/topic/:id', authenticateTokenAdmin, requireRole(['admin', 'content']), VocabularyController.updateTopicVocabulary)

export const vocabularyRoutes = router;
