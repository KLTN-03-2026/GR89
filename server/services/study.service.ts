import mongoose, { Types } from 'mongoose';
import { StudyHistory } from '../models/studyHistory.model';

export interface ISaveProgressOptions {
  userId: string | Types.ObjectId;
  lessonId: string | Types.ObjectId;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progress?: number;
  point?: number;
  isCompleted?: boolean;
  studyTime?: number;

  resultId?: mongoose.Types.ObjectId[] | string[];
}

export class StudyService {
  static async saveStudyResult(options: ISaveProgressOptions) {
    const {
      userId,
      lessonId,
      category,
      level = 'A1',
      progress = 0,
      studyTime = 0,
      resultId
    } = options;

    const userIdObj =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const lessonIdObj =
      typeof lessonId === 'string' ? new Types.ObjectId(lessonId) : lessonId;

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
          throw new Error('Invalid category');
      }
    };

    const resultModel = getResultModel(category);

    // convert resultId
    const resultIds = (resultId || []).map((id) =>
      typeof id === 'string' ? new Types.ObjectId(id) : id
    );

    // status
    let status: 'passed' | 'failed' | 'in_progress' = 'in_progress';
    status = progress >= 80 ? 'passed' : 'failed';

    const history = await StudyHistory.create({
      userId: userIdObj,
      lessonId: lessonIdObj,
      category,
      level,
      progress,
      duration: studyTime,
      status,
      resultId: resultIds,
      resultModel
    });

    return history;
  }
}
