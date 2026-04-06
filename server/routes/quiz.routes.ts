import express from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticateTokenAdmin, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

/*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

/*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

// (ADMIN) Lấy danh sách tất cả câu hỏi trắc nghiệm
router.get("/", authenticateTokenAdmin, requireRole(["admin", "content"]), QuizController.getAllQuiz);

/*============================ NGƯỜI DÙNG & CHUNG ============================*/

/*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

// (ADMIN) Tạo câu hỏi trắc nghiệm mới
router.post("/", authenticateTokenAdmin, requireRole(["admin", "content"]), QuizController.createQuiz);

// (ADMIN) Cập nhật câu hỏi trắc nghiệm
router.put("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), QuizController.updateQuiz);

// (ADMIN) Xóa câu hỏi trắc nghiệm
router.delete("/:id", authenticateTokenAdmin, requireRole(["admin", "content"]), QuizController.deleteQuiz);

export const quizRoutes = router;
