import { IQuiz, Quiz } from "../models/quiz.model";
import ErrorHandler from "../utils/ErrorHandler";

interface IQuizData {
  question: string;
  type: 'Multiple Choice' | 'Fill in the blank';
  options?: string[];
  answer: string;
  explanation: string;
}

export class QuizService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy tất cả câu hỏi trắc nghiệm
  static async getAllQuiz(): Promise<IQuiz[]> {
    const quiz = await Quiz.find();
    return quiz;
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo câu hỏi trắc nghiệm mới
  static async createQuiz(quizData: IQuizData): Promise<IQuiz> {
    const quiz = await Quiz.create(quizData);
    return quiz;
  }

  // (ADMIN) Cập nhật thông tin câu hỏi trắc nghiệm
  static async updateQuiz(quizId: string, quizData: IQuizData): Promise<IQuiz> {
    const quiz = await Quiz.findByIdAndUpdate(quizId, quizData, { new: true });
    if (!quiz) throw new ErrorHandler("Câu hỏi không tồn tại", 404);
    return quiz as unknown as IQuiz;
  }

  // (ADMIN) Xóa câu hỏi trắc nghiệm
  static async deleteQuiz(quizId: string): Promise<IQuiz> {
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) throw new ErrorHandler("Câu hỏi không tồn tại", 404);
    return quiz as unknown as IQuiz;
  }
}