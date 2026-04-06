import { Types } from 'mongoose';
import { UserProgress } from '../models/userProgress.model';
import { StudyHistory } from '../models/studyHistory.model';

export interface ISaveProgressOptions {
  userId: string | Types.ObjectId;
  lessonId: string | Types.ObjectId;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  // Progress data
  progress?: number;
  point?: number;
  isCompleted?: boolean;
  studyTime?: number;

  // History & Result data
  resultId?: Types.ObjectId[] | string[]; // Dùng cho Quizz (Grammar, Reading, Vocab)
  resultData?: any;                       // Dùng cho Listening, Writing, Speaking...
  correctAnswers?: number;
  totalQuestions?: number;
  weakPoints?: string[];
}

export class StudyService {
  /**
   * Lưu cả tiến độ (UserProgress) và lịch sử (StudyHistory)
   */
  static async saveStudyResult(options: ISaveProgressOptions) {
    const {
      userId, lessonId, category, level = 'A1',
      progress = 0, point = 0, isCompleted = false, studyTime = 0,
      resultId = [], resultData = {}, correctAnswers = 0, totalQuestions = 0, weakPoints = []
    } = options;

    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const lessonIdObj = typeof lessonId === 'string' ? new Types.ObjectId(lessonId) : lessonId;

    // 1. Lưu vào StudyHistory (Lưu tất cả các lần làm)
    const history = await StudyHistory.create({
      userId: userIdObj,
      lessonId: lessonIdObj,
      category,
      level,
      score: point,
      duration: studyTime,
      correctAnswers,
      totalQuestions,
      resultData: resultId.length > 0 ? resultId : resultData, // Ưu tiên lưu ID nếu có
      weakPoints,
      status: isCompleted ? 'passed' : 'failed'
    });

    // 2. Cập nhật UserProgress (Chỉ lưu Best Score)
    const existingProgress = await UserProgress.findOne({
      userId: userIdObj,
      lessonId: lessonIdObj,
      category
    });

    const getResultModel = (cat: string) => {
      switch (cat) {
        case 'grammar':
        case 'vocabulary':
        case 'reading':
          return 'QuizResult';
        case 'writing':
          return 'WritingUser';
        case 'speaking':
          return 'SpeakingProgress';
        case 'ipa':
          return 'IpaProgress';
        case 'listening':
          return 'ListeningProgress';
        default:
          return 'StudyHistory';
      }
    };

    const resultModel = getResultModel(category);

    if (existingProgress) {
      // Chỉ cập nhật nếu điểm mới cao hơn hoặc bài học được hoàn thành lần đầu
      const isNewBest = point > (existingProgress.point || 0);

      const updateData: any = {
        lastLearnDate: new Date(),
        isActive: true
      };

      if (isNewBest) {
        updateData.point = point;
        updateData.progress = progress;
        updateData.isCompleted = existingProgress.isCompleted || isCompleted;
        updateData.correctAnswers = correctAnswers;
        updateData.totalQuestions = totalQuestions;
        updateData.weakPoints = weakPoints;
        updateData.level = level;
        updateData.resultModel = resultModel;

        // Cập nhật kết quả chi tiết của lần tốt nhất
        if (resultId && resultId.length > 0) {
          updateData.resultId = resultId;
        }
        if (resultData && Object.keys(resultData).length > 0) {
          updateData.resultData = resultData;
        }
      } else if (isCompleted && !existingProgress.isCompleted) {
        updateData.isCompleted = true;
      }

      await UserProgress.updateOne(
        { _id: existingProgress._id },
        {
          $set: updateData,
          $inc: { studyTime: studyTime }
        }
      );
    } else {
      // Tạo mới nếu chưa có
      await UserProgress.create({
        userId: userIdObj,
        lessonId: lessonIdObj,
        category,
        point,
        progress,
        isCompleted,
        studyTime,
        correctAnswers,
        totalQuestions,
        weakPoints,
        level,
        resultId: resultId.length > 0 ? resultId : undefined,
        resultModel,
        resultData: resultData && Object.keys(resultData).length > 0 ? resultData : undefined,
        lastLearnDate: new Date()
      });
    }

    return history;
  }
}
