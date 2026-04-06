import { NextFunction, Request, Response } from 'express'
import { QuizService } from '../services/quiz.service'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'

export class QuizController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách tất cả câu hỏi trắc nghiệm
  static getAllQuiz = CatchAsyncError(async (_req: Request, res: Response, _next: NextFunction) => {
    const quiz = await QuizService.getAllQuiz();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách câu hỏi thành công",
      data: quiz,
    });
  });

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo câu hỏi trắc nghiệm mới
  static createQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { question, type, options, answer, explanation } = req.body;
    if (!question || !type || !answer || !explanation)
      return next(new ErrorHandler("Vui lòng nhập đầy đủ thông tin", 400));

    if (type === "Multiple Choice" && (!options || options.length < 2))
      return next(new ErrorHandler("Cần có ít nhất 2 lựa chọn cho câu hỏi trắc nghiệm", 400));

    const quiz = await QuizService.createQuiz({
      question,
      type,
      options,
      answer,
      explanation,
    });
    return res.status(201).json({
      success: true,
      message: "Tạo câu hỏi thành công",
      data: quiz,
    });
  });

  // (ADMIN) Cập nhật thông tin câu hỏi trắc nghiệm
  static updateQuiz = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { question, type, options, answer, explanation } = req.body;
    const quiz = await QuizService.updateQuiz(id, { question, type, options, answer, explanation });
    return res.status(200).json({
      success: true,
      message: "Cập nhật câu hỏi thành công",
      data: quiz,
    });
  });

  // (ADMIN) Xóa câu hỏi trắc nghiệm
  static deleteQuiz = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const quiz = await QuizService.deleteQuiz(id);
    return res.status(200).json({
      success: true,
      message: "Xóa câu hỏi thành công",
      data: quiz,
    });
  });
}
