import mongoose, { ObjectId } from "mongoose";
import { StudyHistory } from "../models/studyHistory.model";
import { StudyService } from "./study.service";
import { StreakService } from "./streak.service";
import { IVocabularyTopic, VocabularyTopic, IVocabularyTopicPaginateResult } from "../models/vocabularyTopic.model";
import ErrorHandler from "../utils/ErrorHandler";
import { MediaService } from "./media.service";
import { IVocabulary, Vocabulary } from "../models/vocabulary.model";
import { IQuiz, Quiz } from "../models/quiz.model";
import { shuffle } from "../utils/shuffle.util";
import { IQuizResult, QuizResult } from "../models/quizzResult.model";
import XLSX from 'xlsx'
import { User } from "../models/user.model";

interface ITopicVocabularyUserResponse extends IVocabularyTopic {
  isCompleted: boolean;
  point: number;
}

interface ITopicData {
  name: string;
  image: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  createdBy: string;
}

interface IVocabularyData {
  word: string;
  transcription: string;
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition' | 'Conjunction' | 'Interjection'; //Từ loại
  definition: string;
  vietnameseMeaning: string;
  example: string;
  image: string;
  vocabularyTopicId: string;
  createdBy: string;
}

export class VocabularyService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về từ vựng
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await VocabularyTopic.countDocuments();
    const activeLessons = await VocabularyTopic.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await StudyHistory.countDocuments({ category: 'vocabulary' });
    const completedProgressRecords = await StudyHistory.countDocuments({ category: 'vocabulary', status: 'passed' });

    const topics = await VocabularyTopic.find({ isActive: true }).populate('vocabularies');
    const totalWords = topics.reduce((sum, topic) => {
      return sum + (topic.vocabularies?.length || 0);
    }, 0);

    // Tính tỷ lệ hoàn thành
    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    // Tính lượt học tháng này
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await StudyHistory.countDocuments({
      category: 'vocabulary',
      createdAt: { $gte: currentMonth }
    })

    // Tính lượt học tháng trước để so sánh
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await StudyHistory.countDocuments({
      category: 'vocabulary',
      createdAt: {
        $gte: lastMonth,
        $lt: currentMonth
      }
    })

    // Tính phần trăm thay đổi
    const monthlyChange = lastMonthLearns > 0
      ? Math.round(((monthlyLearns - lastMonthLearns) / lastMonthLearns) * 100)
      : monthlyLearns > 0 ? 100 : 0

    return {
      totalLessons,
      activeLessons,
      totalWords,
      totalUsers,
      completionRate,
      monthlyLearns,
      monthlyChange,
      completedProgressRecords,
      totalProgressRecords
    };
  }

  // (ADMIN) Xuất dữ liệu từ vựng ra file Excel
  static async exportVocabularyData(): Promise<Buffer> {
    const topics = await VocabularyTopic.find()
      .populate({ path: 'vocabularies', options: { sort: { _id: 1 } } })
      .populate({ path: 'quizzes', options: { sort: { _id: 1 } } })
      .sort({ orderIndex: 1 })
      .lean()

    const topicsRows: any[][] = [['topicId', 'name', 'image', 'level']]
    const wordsRows: any[][] = [['topicKey', 'word', 'transcription', 'partOfSpeech', 'definition', 'vietnameseMeaning', 'example', 'image']]
    const quizzesRows: any[][] = [['topicKey', 'question', 'type', 'options', 'answer', 'explanation']]

    for (const t of (topics as any[])) {
      topicsRows.push([String(t._id || ''), t.name || '', t.image ? String(t.image) : '', t.level || 'A1'])
        ; (t.vocabularies || []).forEach((v: any) => {
          wordsRows.push([
            String(t._id || ''), v.word || '', v.transcription || '', v.partOfSpeech || '', v.definition || '', v.vietnameseMeaning || '', v.example || '', v.image ? String(v.image) : ''
          ])
        })
        ; (t.quizzes || []).forEach((q: any) => {
          const isMCQ = q.type === 'Multiple Choice'
          const options = isMCQ && Array.isArray(q.options) ? q.options.join('|') : ''
          quizzesRows.push([String(t._id || ''), q.question || '', q.type || '', options, q.answer || '', q.explanation || ''])
        })
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topicsRows), 'Topics')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wordsRows), 'Vocabularies')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(quizzesRows), 'Quizzes')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }


  // (ADMIN) Import dữ liệu chủ đề từ vựng từ JSON
  static async importVocabularyTopicsFromJson(options: {
    topics: any[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { topics, userId, skipErrors } = options
    const errors: any[] = []
    let created = 0
    let updated = 0
    let skipped = 0

    const failOrCollect = (index: number, reason: string) => {
      if (!skipErrors) {
        throw new ErrorHandler(`Import thất bại tại topic [${index}]: ${reason}`, 400)
      }
      errors.push({ index, reason })
      skipped += 1
    }

    const normalizeString = (raw: unknown) => String(raw ?? '').trim()

    for (let i = 0; i < topics.length; i++) {
      const topicData = topics[i]
      if (!topicData || typeof topicData !== 'object') {
        failOrCollect(i, 'Topic phải là object')
        continue
      }

      try {
        const name = normalizeString(topicData.name)
        if (!name) throw new Error('Thiếu hoặc rỗng "name"')

        const imageInput = topicData.image ? normalizeString(topicData.image) : undefined
        const imageId = imageInput ? await this.resolveMediaId(imageInput, userId) : undefined

        const isVipRequired = typeof topicData.isVipRequired === 'boolean' ? topicData.isVipRequired : true
        const isActive = typeof topicData.isActive === 'boolean' ? topicData.isActive : false
        const levelRaw = topicData.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        const wordsInput = Array.isArray(topicData.words) ? topicData.words : []
        const quizzesInput = Array.isArray(topicData.quizzes) ? topicData.quizzes : []

        // Validate words
        const normalizedWords = await Promise.all(wordsInput.map(async (w: any, j: number) => {
          if (!w.word) throw new Error(`Từ [${j}] thiếu "word"`)
          if (!w.transcription) throw new Error(`Từ [${j}] thiếu "transcription"`)
          if (!w.partOfSpeech) throw new Error(`Từ [${j}] thiếu "partOfSpeech"`)
          if (!w.definition) throw new Error(`Từ [${j}] thiếu "definition"`)
          if (!w.vietnameseMeaning) throw new Error(`Từ [${j}] thiếu "vietnameseMeaning"`)
          if (!w.example) throw new Error(`Từ [${j}] thiếu "example"`)
          if (!w.image) throw new Error(`Từ [${j}] thiếu "image"`)

          const wordImageId = await this.resolveMediaId(w.image, userId)

          return {
            word: normalizeString(w.word),
            transcription: normalizeString(w.transcription),
            partOfSpeech: normalizeString(w.partOfSpeech),
            definition: normalizeString(w.definition),
            vietnameseMeaning: normalizeString(w.vietnameseMeaning),
            example: normalizeString(w.example),
            image: wordImageId,
            isVipRequired: typeof w.isVipRequired === 'boolean' ? w.isVipRequired : true,
            createdBy: new mongoose.Types.ObjectId(userId)
          }
        }))

        // Validate quizzes
        const normalizedQuizzes = quizzesInput.map((q: any, j: number) => {
          if (!q.question) throw new Error(`Câu hỏi [${j}] thiếu "question"`)
          if (!q.type) throw new Error(`Câu hỏi [${j}] thiếu "type"`)
          if (!q.answer) throw new Error(`Câu hỏi [${j}] thiếu "answer"`)
          if (!q.explanation) throw new Error(`Câu hỏi [${j}] thiếu "explanation"`)

          return {
            question: normalizeString(q.question),
            type: q.type,
            answer: normalizeString(q.answer),
            explanation: normalizeString(q.explanation),
            options: Array.isArray(q.options) ? q.options.map((o: string) => normalizeString(o)) : []
          }
        })

        let existingTopic = await VocabularyTopic.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existingTopic) {
          if (imageId) existingTopic.image = imageId as any
          existingTopic.isVipRequired = isVipRequired
          existingTopic.isActive = isActive
          existingTopic.level = level
          existingTopic.updatedBy = new mongoose.Types.ObjectId(userId)

          await Vocabulary.deleteMany({ _id: { $in: existingTopic.vocabularies } })
          await Quiz.deleteMany({ _id: { $in: existingTopic.quizzes } })

          const vocabDocs = await Vocabulary.insertMany(normalizedWords.map((w: IVocabulary) => ({ ...w, vocabularyTopicId: existingTopic!._id })))
          const quizDocs = await Quiz.insertMany(normalizedQuizzes)

          existingTopic.vocabularies = vocabDocs.map(v => v._id as any)
          existingTopic.quizzes = quizDocs.map(q => q._id as any)

          await existingTopic.save()
          updated++
        } else {
          if (!imageId) throw new Error('Chủ đề mới cần có ảnh')

          const newTopic = new VocabularyTopic({
            name,
            image: imageId,
            isVipRequired,
            isActive,
            level,
            createdBy: new mongoose.Types.ObjectId(userId)
          })

          const vocabDocs = await Vocabulary.insertMany(normalizedWords.map((w: IVocabulary) => ({ ...w, vocabularyTopicId: newTopic._id })))
          const quizDocs = await Quiz.insertMany(normalizedQuizzes)

          newTopic.vocabularies = vocabDocs.map(v => v._id as any)
          newTopic.quizzes = quizDocs.map(q => q._id as any)

          await newTopic.save()
          created++
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: topics.length, skipped, errors }
  }

  // Helper xử lý Media ID hoặc URL
  private static async resolveMediaId(imageInput: string, userId: string): Promise<mongoose.Types.ObjectId> {
    const input = String(imageInput || '').trim();
    if (!input) throw new ErrorHandler('Thiếu thông tin media', 400);

    if (mongoose.Types.ObjectId.isValid(input)) {
      const media = await MediaService.getMediaById(input);
      if (media) return new mongoose.Types.ObjectId(input);
    }

    const urlPattern = /^(https?:\/\/)/i;
    if (urlPattern.test(input)) {
      try {
        const media = await MediaService.createImageFromUrl(input, userId);
        return media._id as mongoose.Types.ObjectId;
      } catch (error: any) {
        throw new ErrorHandler(`Không thể xử lý URL ảnh: ${error.message}`, 400);
      }
    }

    throw new ErrorHandler(`Thông tin ảnh không hợp lệ: ${input}`, 400);
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách chủ đề từ vựng (có phân trang & tìm kiếm)
  static async getAllTopicsPaginated(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    createdBy?: string
  }): Promise<IVocabularyTopicPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = options

    const query: any = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }]
    }
    if (isActive !== undefined) {
      query.isActive = isActive
    }
    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy)
    }

    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        { path: 'image', select: '_id url' },
        { path: 'createdBy', select: 'fullName email' },
        { path: 'updatedBy', select: 'fullName email' }
      ],
      lean: false,
      customLabels: {
        docs: 'topics'
      }
    }

    return await VocabularyTopic.paginate(query, paginateOptions)
  }

  // (ADMIN) Xóa nhiều chủ đề từ vựng
  static async deleteManyVocabularyTopics(ids: string[]): Promise<{ deletedCount: number; deletedTopics: IVocabularyTopic[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID chủ đề từ vựng trống', 400)
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const topicsToDelete = await VocabularyTopic.find({ _id: { $in: ids } }).session(session).sort({ orderIndex: 1 })
      if (topicsToDelete.length === 0) {
        throw new ErrorHandler('Không tìm thấy chủ đề từ vựng nào để xóa', 404)
      }

      for (const topic of topicsToDelete) {
        if (topic.vocabularies && topic.vocabularies.length > 0) {
          const vocabIds = topic.vocabularies.filter(v => v && mongoose.Types.ObjectId.isValid(v.toString())).map(v => v.toString())
          if (vocabIds.length > 0) {
            await Vocabulary.deleteMany({ _id: { $in: vocabIds } }).session(session).catch(() => { })
          }
        }
        if (topic.quizzes && topic.quizzes.length > 0) {
          const quizIds = topic.quizzes.filter(q => q && mongoose.Types.ObjectId.isValid(q.toString())).map(q => q.toString())
          if (quizIds.length > 0) {
            await Quiz.deleteMany({ _id: { $in: quizIds } }).session(session).catch(() => { })
          }
        }
      }

      const delRes = await VocabularyTopic.deleteMany({ _id: { $in: ids } }).session(session) as any

      const deletedOrderIndexes = topicsToDelete.map(t => t.orderIndex).sort((a, b) => a - b)
      for (const deletedOrderIndex of deletedOrderIndexes) {
        await VocabularyTopic.updateMany(
          { orderIndex: { $gt: deletedOrderIndex } },
          { $inc: { orderIndex: -1 } }
        ).session(session)
      }

      await session.commitTransaction()
      return {
        deletedCount: Number(delRes?.deletedCount || 0),
        deletedTopics: topicsToDelete as IVocabularyTopic[]
      }
    } catch (e: any) {
      await session.abortTransaction()
      throw e
    } finally {
      session.endSession()
    }
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều chủ đề
  static async updateManyVocabularyTopicsStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedTopics: IVocabularyTopic[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID chủ đề từ vựng trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const topics = await VocabularyTopic.find({ _id: { $in: validIds } })

    if (topics.length !== validIds.length) {
      throw new ErrorHandler(`Không tìm thấy một số chủ đề`, 404)
    }

    if (isActive) {
      const invalidTopics: string[] = []
      for (const topic of topics) {
        if (!topic.vocabularies || topic.vocabularies.length < 10) {
          invalidTopics.push(topic.name)
        }
      }

      if (invalidTopics.length > 0) {
        throw new ErrorHandler(
          `Các chủ đề sau không đủ điều kiện xuất bản (cần >= 10 từ): ${invalidTopics.join(', ')}`,
          400
        )
      }
    }

    const result = await VocabularyTopic.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedTopics = await VocabularyTopic.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedTopics: updatedTopics as IVocabularyTopic[]
    }
  }

  // (ADMIN) Xóa nhiều từ vựng
  static async deleteManyVocabularies(vocabularyIds: string[]): Promise<{ deletedCount: number }> {
    if (!Array.isArray(vocabularyIds) || vocabularyIds.length === 0) {
      throw new ErrorHandler('Danh sách ID từ vựng trống', 400)
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const vocabDocs = await Vocabulary.find({ _id: { $in: vocabularyIds } }).session(session)
      const delRes = await Vocabulary.deleteMany({ _id: { $in: vocabularyIds } }).session(session) as any

      const topicIdToVocabIds = new Map<string, string[]>()
      for (const v of vocabDocs as any[]) {
        const tId = String(v?.vocabularyTopicId || '')
        if (!tId) continue
        if (!topicIdToVocabIds.has(tId)) topicIdToVocabIds.set(tId, [])
        topicIdToVocabIds.get(tId)!.push(String(v._id))
      }

      const updates: Promise<any>[] = []
      for (const [topicId, ids] of topicIdToVocabIds.entries()) {
        updates.push(
          VocabularyTopic.updateOne(
            { _id: topicId },
            { $pullAll: { vocabularies: ids.map(id => new mongoose.Types.ObjectId(id)) } }
          ).session(session)
        )
      }
      await Promise.all(updates)

      await session.commitTransaction()
      return { deletedCount: Number(delRes?.deletedCount || 0) }
    } catch (e) {
      await session.abortTransaction()
      throw e
    } finally {
      session.endSession()
    }
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  static async getVocabularyListByUser(userId: string | mongoose.Types.ObjectId): Promise<ITopicVocabularyUserResponse[]> {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

    const topics = await VocabularyTopic.find({ isActive: true })
      .populate({ path: 'image', select: '_id url' })
      .sort({ orderIndex: 1 })

    const progresses = await StudyHistory.aggregate([
      { $match: { userId: userIdObj, category: 'vocabulary' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])
    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    return topics.map((topic) => {
      const p = progressMap.get(String(topic._id))
      const topicObj = topic.toObject()
      return {
        ...topicObj,
        isCompleted: p?.status === 'passed',
        isActive: true,
        point: p?.progress || 0,
        isResult: !!(p && ((p.resultId && p.resultId.length > 0) || (p.progress || 0) > 0 || p.status === 'passed')),
        isVipRequired: topicObj.isVipRequired !== undefined ? topicObj.isVipRequired : true,
      } as unknown as ITopicVocabularyUserResponse
    })
  }

  // (USER) Lấy danh sách các chủ đề từ vựng kèm tiến độ người dùng
  static async getTopicsByLevel(userId: string, level: string): Promise<ITopicVocabularyUserResponse[]> {
    const topics = await VocabularyTopic.find({
      level: level as any,
      isActive: true
    }).sort({ orderIndex: 1 })

    // Lấy bản ghi tốt nhất từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category: 'vocabulary' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])
    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    return topics.map((topic) => {
      const p = progressMap.get(String(topic._id))
      const topicObj = topic.toObject()
      return {
        ...topicObj,
        isCompleted: p?.status === 'passed',
        isActive: true,
        point: p?.progress || 0,
        isResult: p ? p.progress > 0 : false,
        isVipRequired: topicObj.isVipRequired !== undefined ? topicObj.isVipRequired : true,
      } as unknown as ITopicVocabularyUserResponse
    })
  }

  // (USER) Lấy danh sách câu hỏi quiz của chủ đề
  static async getQuizByVocabulary(vocabularyTopicId: string): Promise<IQuiz[]> {
    const vocabularyQuiz = await VocabularyTopic.findById(vocabularyTopicId).populate({
      path: 'quizzes',
      select: 'question options answer explanation type'
    });
    if (!vocabularyQuiz) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);
    const quizzes = vocabularyQuiz.quizzes;
    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return [];
    }
    return shuffle(quizzes as unknown as IQuiz[]);
  }

  // (USER) Nộp bài kiểm tra từ vựng
  static async doQuizVocabulary(
    vocabularyTopicId: string,
    userId: string,
    quizResults: IQuizResult[],
    studyTimeSeconds: number = 0
  ): Promise<any> {
    const topic = await VocabularyTopic.findById(vocabularyTopicId)
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404)

    // Lưu kết quả Quiz vào DB để lấy ID
    const createdResults = await QuizResult.insertMany(quizResults);
    const resultId = createdResults.map(d => d._id as mongoose.Types.ObjectId);

    const correctCount = quizResults.filter(r => r.isCorrect).length
    const point = Math.round(((correctCount / (quizResults.length || 1)) * 100) * 100) / 100
    const progress = point // Với vocab, point chính là progress

    // Lấy tags của các câu sai để làm weakPoints
    // const incorrectQuizzes = await Quiz.find({ _id: { $in: quizResults.filter(r => !r.isCorrect).map(r => r.quizId) } }).select('tags')
    const weakPoints = Array.from([])

    // Lưu qua StudyService (Unified)
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: vocabularyTopicId,
      category: 'vocabulary',
      level: (topic as any).level || 'A1',
      progress,
      point,
      isCompleted: true, // Không cần >= 80, chỉ cần có làm là tính hoàn thành
      studyTime: studyTimeSeconds,
      resultId, // Lưu ID vào Progress/History
      correctAnswers: correctCount,
      totalQuestions: quizResults.length,
      weakPoints
    })

    // Luôn cập nhật streak khi có tham gia làm bài
    await StreakService.updateStreak(userId)

    return history
  }

  // (USER) Lấy tiến độ của một chủ đề từ vựng cụ thể
  static async getVocabularyUserProgress(vocabularyTopicId: string, userId: string) {
    return await StudyHistory.findOne({
      lessonId: new mongoose.Types.ObjectId(vocabularyTopicId),
      userId: new mongoose.Types.ObjectId(userId),
      category: 'vocabulary'
    }).sort({ progress: -1, createdAt: -1 });
  }

  // (USER) Lấy kết quả quiz của chủ đề
  static async getVocabularyResult(vocabularyTopicId: string, userId: string): Promise<any> {
    const history = await StudyHistory.findOne({
      lessonId: new mongoose.Types.ObjectId(vocabularyTopicId),
      userId: new mongoose.Types.ObjectId(userId),
      category: 'vocabulary'
    }).sort({ progress: -1, createdAt: -1 });

    if (!history) throw new ErrorHandler('Tiến độ học tập không tồn tại', 404);

    if (!history.resultId || history.resultId.length === 0) return []

    const results = await QuizResult.find({ _id: { $in: history.resultId } })
      .populate({ path: 'quizId', select: 'question answer explanation' })
      .sort({ questionNumber: 1 })
      .lean()

    return results.map(r => ({
      questionNumber: r.questionNumber,
      question: (r.quizId as any)?.question ?? '',
      userAnswer: r.userAnswer ?? '',
      correctAnswer: (r.quizId as any)?.answer ?? '',
      explanation: (r.quizId as any)?.explanation ?? '',
    }))
  }

  // (USER) Lấy tổng quan học từ vựng (Dashboard)
  static async getVocabularyOverview(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [topics, progressesAggregation] = await Promise.all([
      VocabularyTopic.find({ isActive: true }).select('_id name vocabularies').lean(),
      StudyHistory.aggregate([
        { $match: { userId: userObjectId, category: 'vocabulary' } },
        { $sort: { progress: -1, createdAt: -1 } },
        { $group: { _id: "$lessonId", best: { $first: "$$ROOT" }, totalTime: { $sum: "$duration" } } }
      ])
    ])

    const activeTopicIds = new Set(topics.map(t => String(t._id)))
    const activeProgresses = progressesAggregation.filter(p => activeTopicIds.has(String(p._id)))

    const completedTopicIds = new Set(
      activeProgresses.filter(p => p.best.status === 'passed').map(p => String(p._id))
    )
    const learnedWords = topics
      .filter(t => completedTopicIds.has(String(t._id)))
      .reduce((sum, t: any) => sum + (Array.isArray(t.vocabularies) ? t.vocabularies.length : 0), 0)

    const completedTopics = activeProgresses.filter(p => p.best.status === 'passed').length
    const totalTopics = topics.length
    const learnedProgresses = activeProgresses.filter(p => (p.best.resultId?.length || 0) > 0 || (p.best.progress || 0) > 0 || p.best.status === 'passed')
    const avgScore = learnedProgresses.length
      ? Math.round((learnedProgresses.reduce((s: number, p: any) => s + (p.best.progress || 0), 0) / learnedProgresses.length) * 100) / 100
      : 0
    const totalScore = Math.round(activeProgresses.reduce((s: number, p: any) => s + (p.best.progress || 0), 0) * 100) / 100
    const totalTime = activeProgresses.reduce((sum: number, p: any) => sum + (p.totalTime || 0), 0)

    return { learnedWords, completedTopics, totalTopics, avgScore, totalScore, totalTime }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề và danh sách từ vựng
  static async getAllVocabularyByTopic(topicId: string): Promise<IVocabularyTopic> {
    const vocabularyTopicDoc = await VocabularyTopic.findById(topicId).populate({
      path: 'image',
      select: '_id url'
    }).populate({
      path: 'createdBy',
      select: 'fullName email'
    }).populate({
      path: 'updatedBy',
      select: 'fullName email'
    }).populate({
      path: 'vocabularies',
      populate: [{ path: 'image', select: '_id url' }, { path: 'createdBy', select: 'fullName email' }, { path: 'updatedBy', select: 'fullName email' }]
    }).populate({
      path: 'quizzes',
      select: 'question options answer explanation type'
    })

    if (!vocabularyTopicDoc) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);
    return vocabularyTopicDoc.toObject() as unknown as IVocabularyTopic;
  }

  // (ADMIN) Tạo chủ đề từ vựng mới
  static async createTopicVocabulary(topicData: ITopicData): Promise<IVocabularyTopic> {
    const { name, image, createdBy, level } = topicData;
    const nameExist = await VocabularyTopic.findOne({ name: name.trim() });
    if (nameExist) throw new ErrorHandler('Chủ đề từ vựng đã tồn tại', 400);

    const lastTopic = await VocabularyTopic.findOne().sort({ orderIndex: -1 });
    const nextOrderIndex = (lastTopic?.orderIndex || 0) + 1;

    const imageExist = await MediaService.getMediaById(image);
    if (!imageExist) throw new ErrorHandler('Ảnh không tồn tại', 404);

    return await VocabularyTopic.create({
      name: name.trim(),
      image,
      level,
      orderIndex: nextOrderIndex,
      createdBy
    })
  }

  // (ADMIN) Cập nhật chủ đề từ vựng
  static async updateTopicVocabulary(topicId: string, topicData: ITopicData): Promise<IVocabularyTopic> {
    const { name, image, createdBy, level } = topicData;
    const vocabularyTopic = await VocabularyTopic.findById(topicId);
    if (!vocabularyTopic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);

    if (image) {
      const imageExist = await MediaService.getMediaById(image);
      if (!imageExist) throw new ErrorHandler('Ảnh không tồn tại', 404);
    }

    vocabularyTopic.name = name;
    vocabularyTopic.image = image as unknown as ObjectId;
    vocabularyTopic.level = level;
    vocabularyTopic.updatedBy = createdBy as unknown as mongoose.Types.ObjectId;
    await vocabularyTopic.save();

    return vocabularyTopic;
  }

  // (ADMIN) Xóa chủ đề từ vựng
  static async deleteTopicVocabulary(topicId: string): Promise<IVocabularyTopic> {
    const vocabularyTopic = await VocabularyTopic.findByIdAndDelete(topicId);
    if (!vocabularyTopic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);

    await VocabularyTopic.updateMany({ orderIndex: { $gt: vocabularyTopic.orderIndex } }, { $inc: { orderIndex: -1 } });
    return vocabularyTopic;
  }

  // (ADMIN) Thay đổi thứ tự chủ đề (Lên/Xuống)
  static async swapOrderIndex(topicId: string, direction: 'up' | 'down') {
    const current = await VocabularyTopic.findById(topicId);
    if (!current) throw new ErrorHandler('Không tìm thấy chủ đề', 404);

    const adjacent = await VocabularyTopic.findOne(
      direction === 'up'
        ? { orderIndex: { $lt: current.orderIndex } }
        : { orderIndex: { $gt: current.orderIndex } }
    ).sort({ orderIndex: direction === 'up' ? -1 : 1 });

    if (!adjacent) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = current.orderIndex;
    const adjacentIndex = adjacent.orderIndex;

    const temp = Date.now();
    await VocabularyTopic.updateOne({ _id: current._id }, { orderIndex: temp });
    await VocabularyTopic.updateOne({ _id: adjacent._id }, { orderIndex: currentIndex });
    await VocabularyTopic.updateOne({ _id: current._id }, { orderIndex: adjacentIndex });

    return { current, swappedTopic: adjacent };
  }

  // (ADMIN) Bật/tắt trạng thái xuất bản chủ đề
  static async updateTopicVocabularyStatus(topicId: string): Promise<IVocabularyTopic> {
    const vocabularyTopic = await VocabularyTopic.findById(topicId);
    if (!vocabularyTopic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);

    if (!vocabularyTopic.isActive && vocabularyTopic.vocabularies.length < 10) {
      throw new ErrorHandler('Chủ đề cần ít nhất 10 từ vựng để xuất bản', 400);
    }
    vocabularyTopic.isActive = !vocabularyTopic.isActive;
    await vocabularyTopic.save();
    return vocabularyTopic;
  }

  // (ADMIN) Bật/tắt yêu cầu VIP cho chủ đề
  static async toggleTopicVipStatus(topicId: string): Promise<IVocabularyTopic> {
    const topic = await VocabularyTopic.findById(topicId)
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404)
    topic.isVipRequired = !topic.isVipRequired
    await topic.save()
    return topic
  }

  // (ADMIN) Tạo từ vựng mới
  static async createVocabulary(vocabularyData: IVocabularyData): Promise<IVocabulary> {
    const { createdBy, vocabularyTopicId, image } = vocabularyData;
    if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
      throw new ErrorHandler('Người tạo không hợp lệ', 400);
    }

    const topic = await VocabularyTopic.findById(vocabularyTopicId);
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);

    const imageExist = await MediaService.getMediaById(image);
    if (!imageExist) throw new ErrorHandler('Ảnh không tồn tại', 404);

    const vocabulary = await Vocabulary.create({
      ...vocabularyData,
      createdBy: new mongoose.Types.ObjectId(createdBy)
    });
    topic.vocabularies.push(vocabulary._id as unknown as ObjectId);
    await topic.save();
    return vocabulary;
  }

  // (ADMIN) Cập nhật từ vựng
  static async updateVocabulary(vocabularyId: string, vocabularyData: IVocabularyData): Promise<IVocabulary> {
    const vocabulary = await Vocabulary.findByIdAndUpdate(vocabularyId, vocabularyData, { new: true });
    if (!vocabulary) throw new ErrorHandler('Từ vựng không tồn tại', 404);
    return vocabulary;
  }

  // (ADMIN) Xóa từ vựng
  static async deleteVocabulary(vocabularyId: string): Promise<IVocabulary> {
    const vocabulary = await Vocabulary.findByIdAndDelete(vocabularyId);
    if (!vocabulary) throw new ErrorHandler('Từ vựng không tồn tại', 404);

    const topicId = (vocabulary as any).vocabularyTopicId;
    if (topicId) {
      await VocabularyTopic.findByIdAndUpdate(topicId, { $pull: { vocabularies: vocabularyId } });
    }
    return vocabulary;
  }

  // (ADMIN) Lấy danh sách quiz của chủ đề
  static async getAllQuizByTopic(topicId: string): Promise<IQuiz[]> {
    const topic = await VocabularyTopic.findById(topicId).populate('quizzes');
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);
    return topic.quizzes as unknown as IQuiz[];
  }

  // (ADMIN) Tạo quiz mới cho chủ đề
  static async createQuizByTopic(topicId: string, quizData: IQuiz): Promise<IQuiz> {
    const topic = await VocabularyTopic.findById(topicId);
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);
    const quiz = await Quiz.create(quizData);
    topic.quizzes.push(quiz._id as unknown as ObjectId);
    await topic.save();
    return quiz as unknown as IQuiz;
  }

  // (ADMIN) Xóa quiz của chủ đề
  static async deleteQuizByTopic(topicId: string, quizId: string): Promise<IQuiz> {
    const topic = await VocabularyTopic.findById(topicId);
    if (!topic) throw new ErrorHandler('Chủ đề từ vựng không tồn tại', 404);
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (quiz) {
      await VocabularyTopic.findByIdAndUpdate(topicId, { $pull: { quizzes: quizId } });
    }
    return quiz as unknown as IQuiz;
  }
}
