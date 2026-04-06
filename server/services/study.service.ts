import { Types } from 'mongoose';
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
   * Chỉ lưu vào lịch sử (StudyHistory)
   */
  static async saveStudyResult(options: ISaveProgressOptions) {
    const {
      userId, lessonId, category, level = 'A1',
      progress = 0, isCompleted = false, studyTime = 0,
      resultId = [], resultData = {}, correctAnswers = 0, totalQuestions = 0, weakPoints = [],
    } = options;

    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const lessonIdObj = typeof lessonId === 'string' ? new Types.ObjectId(lessonId) : lessonId;

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
          return 'IpaScoring';
        case 'listening':
          return 'ListeningProgress';
        default:
          return 'StudyHistory';
      }
    };

    const resultModel = getResultModel(category);
    const finalResultId = resultId.length > 0 ? resultId : (resultData && Object.keys(resultData).length > 0 ? [new Types.ObjectId()] : []);
    const finalResultModel = resultId.length > 0 ? resultModel : (resultData && Object.keys(resultData).length > 0 ? 'StudyHistory' : resultModel);

    // Lưu vào StudyHistory (Tạo mới mỗi lần làm)
    const history = await StudyHistory.create({
      userId: userIdObj,
      lessonId: lessonIdObj,
      category,
      level,
      progress,
      duration: studyTime,
      correctAnswers,
      totalQuestions,
      weakPoints,
      status: isCompleted ? 'passed' : 'failed',
      resultId: finalResultId,
      resultModel: finalResultModel
    });

    return history;
  }
}
