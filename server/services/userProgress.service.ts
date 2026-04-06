import mongoose from 'mongoose'
import { StudyHistory } from '../models/studyHistory.model'
import { VocabularyTopic } from '../models/vocabularyTopic.model'
import { GrammarTopic } from '../models/grammarTopic.model'
import { Ipa } from '../models/ipa.model'
import { Listening } from '../models/listening.model'
import { Speaking } from '../models/speaking.model'
import { Reading } from '../models/reading.model'
import { writingModel } from '../models/writing.model'

export class UserProgressService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  private static async getProgressByCategory(
    userId: string,
    category: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing',
    model: any,
    titleField: string = 'title'
  ) {
    const userIdObj = new mongoose.Types.ObjectId(userId)

    // 1. Lấy danh sách topic IDs còn tồn tại và active
    const activeIds = await model.find({ isActive: true }).distinct('_id')
    const total = activeIds.length

    // 2. Lấy bản ghi tốt nhất cho mỗi lessonId từ StudyHistory
    const progressesAggregation = await StudyHistory.aggregate([
      {
        $match: {
          userId: userIdObj,
          category,
          lessonId: { $in: activeIds.map((id: string) => new mongoose.Types.ObjectId(id as string)) }
        }
      },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])

    const progresses = progressesAggregation.map(p => p.best)

    // 3. Tính toán
    const completed = progresses.filter(p => p.status === 'passed').length
    const totalPoints = progresses.reduce((sum, p) => sum + (p.progress || 0), 0)

    // Tính tổng thời gian học từ tất cả các lần (History)
    const timeAggregation = await StudyHistory.aggregate([
      { $match: { userId: userIdObj, category, lessonId: { $in: activeIds.length > 0 ? activeIds.map((id: string) => new mongoose.Types.ObjectId(id as string)) : [] } } },
      { $group: { _id: null, totalStudyTime: { $sum: "$duration" } } }
    ])
    const totalStudyTime = timeAggregation[0]?.totalStudyTime || 0

    const averageScore = progresses.length > 0
      ? totalPoints / progresses.length
      : 0

    // 4. Lấy bài gần nhất
    const lastHistory = await StudyHistory.findOne({
      userId: userIdObj,
      category,
      lessonId: { $in: activeIds.length > 0 ? activeIds.map((id: string) => new mongoose.Types.ObjectId(id as string)) : [] }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'lessonId',
        select: titleField,
        model: model.modelName
      })

    return {
      total,
      completed,
      inProgress: progresses.filter(p => p.status !== 'passed').length,
      notStarted: total - progresses.length,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageScore: Math.round(averageScore),
      totalPoints,
      totalStudyTime,
      lastLesson: lastHistory && lastHistory.lessonId ? {
        id: String(lastHistory.lessonId),
        name: (lastHistory.lessonId as any)[titleField] || '',
        score: lastHistory.progress || 0,
        progress: lastHistory.progress || 0
      } : null
    }
  }

  // (USER) Lấy tiến độ Vocabulary
  static async getVocabularyProgress(userId: string) {
    return this.getProgressByCategory(userId, 'vocabulary', VocabularyTopic, 'name')
  }

  // (USER) Lấy tiến độ Grammar
  static async getGrammarProgress(userId: string) {
    return this.getProgressByCategory(userId, 'grammar', GrammarTopic, 'title')
  }

  // (USER) Lấy tiến độ IPA
  static async getIpaProgress(userId: string) {
    return this.getProgressByCategory(userId, 'ipa', Ipa, 'sound')
  }

  // (USER) Lấy tiến độ Listening
  static async getListeningProgress(userId: string) {
    return this.getProgressByCategory(userId, 'listening', Listening, 'title')
  }

  // (USER) Lấy tiến độ Speaking
  static async getSpeakingProgress(userId: string) {
    // Speaking có thêm một số thông tin đặc thù nếu cần, nhưng hiện tại ta thống nhất theo model chung
    return this.getProgressByCategory(userId, 'speaking', Speaking, 'title')
  }

  // (USER) Lấy tiến độ Reading
  static async getReadingProgress(userId: string) {
    return this.getProgressByCategory(userId, 'reading', Reading, 'title')
  }

  // (USER) Lấy tiến độ Writing
  static async getWritingProgress(userId: string) {
    return this.getProgressByCategory(userId, 'writing', writingModel, 'title')
  }
}
