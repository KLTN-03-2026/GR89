import { Types } from 'mongoose'
import { StudyHistory } from '../models/studyHistory.model'
import { writingModel } from '../models/writing.model'
import { VocabularyTopic } from '../models/vocabularyTopic.model'
import { GrammarTopic } from '../models/grammarTopic.model'
import { Reading } from '../models/reading.model'
import { Listening } from '../models/listening.model'
import { Speaking } from '../models/speaking.model'
import { Ipa } from '../models/ipa.model'

export interface LessonSkillStats {
  completed: number
  total: number // Số bài user đã làm
  totalAvailable?: number // Tổng số bài có trong hệ thống (chỉ cho writing, vocabulary, grammar, etc.)
  avgScore: number
  bestScore: number
  totalScore: number
  totalTime: number
  lastActivity?: string
}

export interface LessonStatsResponse {
  vocabulary: LessonSkillStats
  grammar: LessonSkillStats
  reading: LessonSkillStats
  listening: LessonSkillStats
  speaking: LessonSkillStats
  writing: LessonSkillStats
  ipa: LessonSkillStats
}

type ScoreSelector = (doc: any) => number
type CompletedSelector = (doc: any) => boolean
type TimeSelector = (doc: any) => number
type ActivitySelector = (doc: any) => Date | null | undefined

const defaultActivitySelectors: ActivitySelector[] = [
  (doc) => doc.updatedAt,
  (doc) => doc.lastAttempt,
  (doc) => doc.date,
  (doc) => doc.createdAt
]

const defaultStats = (): LessonSkillStats => ({
  completed: 0,
  total: 0,
  avgScore: 0,
  bestScore: 0,
  totalScore: 0,
  totalTime: 0,
  lastActivity: undefined
})

const computeStats = (
  docs: any[],
  options: {
    scoreSelector: ScoreSelector
    completedSelector?: CompletedSelector
    timeSelector?: TimeSelector
    activitySelectors?: ActivitySelector[]
  }
): LessonSkillStats => {
  if (!docs.length) {
    return defaultStats()
  }

  const {
    scoreSelector,
    completedSelector = (doc: any) => Boolean(doc?.isCompleted),
    timeSelector = () => 0,
    activitySelectors = defaultActivitySelectors
  } = options

  let completed = 0
  let totalScore = 0
  let bestScore = 0
  let totalTime = 0
  let latestActivity: Date | null = null

  docs.forEach((doc) => {
    const score = Number(scoreSelector(doc)) || 0
    totalScore += score
    if (score > bestScore) bestScore = score

    if (completedSelector(doc)) completed += 1
    totalTime += Number(timeSelector(doc)) || 0

    for (const selector of activitySelectors) {
      const dateValue = selector(doc)
      if (dateValue) {
        const date = new Date(dateValue)
        if (!latestActivity || date > latestActivity) {
          latestActivity = date
        }
        break
      }
    }
  })

  const total = docs.length
  // Format với 2 chữ số thập phân: Math.round(value * 100) / 100
  const avgScore = total ? Math.round((totalScore / total) * 100) / 100 : 0
  const bestScoreFormatted = Math.round(bestScore * 100) / 100
  const totalScoreFormatted = Math.round(totalScore * 100) / 100

  const lastActivityIso = latestActivity ? (latestActivity as Date).toISOString() : undefined

  return {
    completed,
    total,
    avgScore,
    bestScore: bestScoreFormatted,
    totalScore: totalScoreFormatted,
    totalTime,
    lastActivity: lastActivityIso
  }
}

// Helper function to convert docs to ID set
const toIdSet = (docs: any[]): Set<string> =>
  new Set(docs.map((doc) => String(doc?._id)))

// Helper function to filter docs by active references
const filterByActiveRefs = <T>(
  docs: T[],
  getRef: (doc: T) => Types.ObjectId | string | undefined | null,
  activeIds: Set<string>
) =>
  docs.filter((doc) => {
    const ref = getRef(doc)
    if (!ref) return false
    return activeIds.has(String(ref))
  })

export class LessonStatsService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  private static async getSkillStats(
    userId: string | Types.ObjectId,
    category: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'ipa',
    lessonModel: any
  ): Promise<LessonSkillStats> {
    const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const [activeLessons, progressesAggregation] = await Promise.all([
      lessonModel.find({ isActive: true }).select("_id").lean<{ _id: Types.ObjectId }>(),
      StudyHistory.aggregate([
        { 
          $match: { 
            userId: userObjectId, 
            category 
          } 
        },
        { $sort: { progress: -1, createdAt: -1 } },
        { $group: { _id: "$lessonId", best: { $first: "$$ROOT" }, totalTime: { $sum: "$duration" } } }
      ])
    ]);

    const activeLessonDocs = Array.isArray(activeLessons) ? activeLessons : [];
    const activeLessonIds = new Set(activeLessonDocs.map(l => String(l._id)));

    // Chỉ lấy progress của những bài học còn active
    const activeProgresses = progressesAggregation.filter(p => activeLessonIds.has(String(p._id)));

    const stats = computeStats(
      activeProgresses.map(p => ({
        ...p.best,
        studyTime: p.totalTime, // Dùng tổng thời gian học từ tất cả các lần
        isCompleted: p.best.status === 'passed'
      })),
      {
        scoreSelector: (doc) => doc.progress || 0,
        timeSelector: (doc) => doc.studyTime || 0,
        completedSelector: (doc) => doc.isCompleted
      }
    );

    stats.totalAvailable = activeLessonDocs.length;
    return stats;
  }

  // (USER) Lấy thống kê từ vựng của người dùng
  static async getVocabularyStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'vocabulary', VocabularyTopic);
  }

  // (USER) Lấy thống kê ngữ pháp của người dùng
  static async getGrammarStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'grammar', GrammarTopic);
  }

  // (USER) Lấy thống kê đọc của người dùng
  static async getReadingStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'reading', Reading);
  }

  // (USER) Lấy thống kê nghe của người dùng
  static async getListeningStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'listening', Listening);
  }

  // (USER) Lấy thống kê nói của người dùng
  static async getSpeakingStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'speaking', Speaking);
  }

  // (USER) Lấy thống kê viết của người dùng
  static async getWritingStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'writing', writingModel);
  }

  // (USER) Lấy thống kê IPA của người dùng
  static async getIpaStats(userId: string | Types.ObjectId): Promise<LessonSkillStats> {
    return this.getSkillStats(userId, 'ipa', Ipa);
  }

  // (USER) Lấy tổng quan thống kê các kỹ năng của người dùng
  static async getOverviewStats(userId: string | Types.ObjectId): Promise<LessonStatsResponse> {
    const [vocabulary, grammar, reading, listening, speaking, writing, ipa] = await Promise.all([
      this.getVocabularyStats(userId),
      this.getGrammarStats(userId),
      this.getReadingStats(userId),
      this.getListeningStats(userId),
      this.getSpeakingStats(userId),
      this.getWritingStats(userId),
      this.getIpaStats(userId),
    ]);

    return {
      vocabulary,
      grammar,
      reading,
      listening,
      speaking,
      writing,
      ipa,
    };
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
}

