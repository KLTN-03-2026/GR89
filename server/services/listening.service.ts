import mongoose from "mongoose"
import XLSX from 'xlsx'
import { IListening, Listening, IListeningPaginateResult } from "../models/listening.model"
import ErrorHandler from "../utils/ErrorHandler"
import { StudyHistory } from '../models/studyHistory.model'
import { StudyService } from './study.service'
import { StreakService } from "./streak.service"
import { User } from "../models/user.model"
import { MediaService } from "./media.service"
import { IQuiz, Quiz } from "../models/quiz.model"
import { IQuizResult, QuizResult } from "../models/quizzResult.model"
import { ListeningProgress } from "../models/listeningProgress.model"
import { Media } from "../models/media.model"

interface IListeningResult {
  progress: number
  point: number
  totalQuestions?: number
  quizPoint: number
  quizTotal: number
  quizProgress?: number
  time: number
  result: {
    index: number
    text: string
    isCorrect: boolean
  }[]
  listeningId: IListening
}

export class ListeningService {
  // (Hỗ trợ Import) Normalize dữ liệu quiz từ input thành mảng IQuiz
  private static normalizeQuizInput(rawQuiz: unknown): IQuiz[] {
    if (rawQuiz == null) return []

    let source: unknown = rawQuiz
    if (typeof rawQuiz === 'string') {
      const trimmed = rawQuiz.trim()
      if (!trimmed) return []
      try {
        source = JSON.parse(trimmed)
      } catch {
        throw new ErrorHandler('Trường quiz phải là JSON hợp lệ', 400)
      }
    }

    if (!Array.isArray(source)) {
      throw new ErrorHandler('Trường quiz phải là mảng câu hỏi', 400)
    }

    return source.map((q, idx) => {
      const question = String((q as any)?.question ?? '').trim()
      const answer = String((q as any)?.answer ?? '').trim()
      const optionsRaw = Array.isArray((q as any)?.options) ? (q as any).options : []
      const options = optionsRaw.map((opt: unknown) => String(opt ?? '').trim()).filter(Boolean)

      if (!question) throw new ErrorHandler(`quiz[${idx}].question không được để trống`, 400)
      if (options.length < 2) throw new ErrorHandler(`quiz[${idx}] phải có ít nhất 2 options`, 400)
      if (!answer) throw new ErrorHandler(`quiz[${idx}].answer không được để trống`, 400)
      if (!options.includes(answer)) throw new ErrorHandler(`quiz[${idx}].answer phải nằm trong options`, 400)

      return { question, options, answer, type: 'Multiple Choice', explanation: '' }
    }) as IQuiz[]
  }

  // (Hỗ trợ Import) Split subtitle thành mảng dòng
  private static splitSubtitleLines(text: string): string[] {
    return String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  }

  // (Hỗ trợ Import) Lấy prefix speaker từ dòng subtitle
  private static getSpeakerPrefix(line: string): string | null {
    const match = String(line || '').trim().match(/^([A-Za-z][A-Za-z0-9_-]{0,20})\s*:/)
    if (!match) return null
    return match[1].toUpperCase()
  }

  // (Hỗ trợ Import) Format dữ liệu listening thành mảng IListening
  private static formatListeningResponse(listening: any, audioUrl: string | null) {
    const quizzesPopulated = listening.quizzes as any[] | undefined
    const quizzes =
      Array.isArray(quizzesPopulated) && quizzesPopulated.length > 0 && typeof (quizzesPopulated[0] as any)?.question === 'string'
        ? quizzesPopulated.map((q: any) => ({
          _id: q._id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer,
        }))
        : []
    const { quizzes: _q, quiz: _legacy, ...rest } = listening
    return {
      ...rest,
      audio: audioUrl,
      quizzes,
    }
  }

  // (Hỗ trợ Import) Migrate legacy quiz from listening collection to Quiz collection
  private static async migrateLegacyQuizFromCollection(listeningId: string): Promise<void> {
    const raw = (await Listening.collection.findOne({
      _id: new mongoose.Types.ObjectId(listeningId),
    })) as { quiz?: unknown } | null
    if (!raw) return
    const legacy = raw.quiz
    if (!Array.isArray(legacy) || legacy.length === 0) return
    const first = legacy[0] as Record<string, unknown>
    if (first && typeof first === 'object' && 'question' in first) {
      const items = this.normalizeQuizInput(legacy)
      await this.replaceListeningQuizzesFromItems(listeningId, items)
    }
  }

  // (Hỗ trợ Import) Xóa tất cả quiz cũ trong listening và thêm Quiz mới
  static async replaceListeningQuizzesFromItems(
    listeningId: string,
    items: IQuiz[]
  ): Promise<void> {
    const lid = new mongoose.Types.ObjectId(listeningId)
    await Quiz.deleteMany({ listeningId: lid })
    if (!items.length) {
      await Listening.findByIdAndUpdate(listeningId, { quizzes: [] })
      await Listening.collection.updateOne({ _id: lid }, { $unset: { quiz: 1 } })
      return
    }
    const docs = await Quiz.insertMany(
      items.map((q, i) => ({
        listeningId: lid,
        question: q.question,
        options: q.options,
        answer: q.answer,
        type: q.type,
        explanation: q.explanation,
        orderIndex: i,
      }))
    )
    await Listening.findByIdAndUpdate(listeningId, {
      quizzes: docs.map((d) => d._id),
    })
    await Listening.collection.updateOne({ _id: lid }, { $unset: { quiz: 1 } })
  }

  // (Hỗ trợ Import) Validate kiểm tra subtitle Tiếng Anh và Việt có khớp nhau không
  private static validateSubtitlePair(subtitle: string, subtitleVi: string) {
    const enLines = this.splitSubtitleLines(subtitle)
    const viLines = this.splitSubtitleLines(subtitleVi)
    if (enLines.length !== viLines.length) {
      throw new ErrorHandler(
        `Số lượng dòng subtitle tiếng Anh (${enLines.length}) phải bằng subtitle tiếng Việt (${viLines.length})`,
        400
      )
    }

    for (let i = 0; i < enLines.length; i++) {
      const enSpeaker = this.getSpeakerPrefix(enLines[i])
      const viSpeaker = this.getSpeakerPrefix(viLines[i])
      if (!!enSpeaker !== !!viSpeaker) {
        throw new ErrorHandler(
          `Dòng ${i + 1} không đồng nhất speaker prefix giữa EN và VI`,
          400
        )
      }

      if (enSpeaker && viSpeaker && enSpeaker !== viSpeaker) {
        throw new ErrorHandler(
          `Speaker không khớp ở dòng ${i + 1}: EN là "${enSpeaker}:" nhưng VI là "${viSpeaker}:"`,
          400
        )
      }
    }
  }

  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về bài nghe
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await Listening.countDocuments();
    const activeLessons = await Listening.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await StudyHistory.countDocuments({ category: 'listening' });
    const completedProgressRecords = await StudyHistory.countDocuments({ category: 'listening', status: 'passed' });

    // Tính tỷ lệ hoàn thành
    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    // Tính lượt học tháng này
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await StudyHistory.countDocuments({
      category: 'listening',
      createdAt: { $gte: currentMonth }
    })

    // Tính lượt học tháng trước để so sánh
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await StudyHistory.countDocuments({
      category: 'listening',
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
      totalUsers,
      completionRate,
      monthlyLearns,
      monthlyChange,
      completedProgressRecords,
      totalProgressRecords
    };
  }

  // (ADMIN) Xuất dữ liệu Listening ra file Excel
  static async exportListeningData(): Promise<Buffer> {
    const listenings = await Listening.find().sort({ orderIndex: 1 }).lean()
    const rows: any[][] = [['ID', 'title', 'description', 'level', 'audioID', 'subtitle', 'subtitleVi', 'quizJson', 'isActive', 'orderIndex']]
    for (const l of listenings as any[]) {
      const quizDocs = await Quiz.find({ listeningId: l._id }).sort({ orderIndex: 1 }).lean()
      const quizPayload = quizDocs.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        type: q.type,
        explanation: q.explanation || '',
      }))
      rows.push([
        String(l._id),
        l.title || '',
        l.description || '',
        l.level || 'A1',
        l.audio ? String(l.audio) : '',
        l.subtitle || '',
        l.subtitleVi || '',
        JSON.stringify(quizPayload),
        !!l.isActive,
        l.orderIndex ?? '',
      ])
    }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Listenings')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }

  // (ADMIN) Import dữ liệu Listening từ JSON
  static async importListeningFromJson(options: {
    listenings: any[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { listenings, userId, skipErrors } = options
    const errors: any[] = []
    let created = 0
    let updated = 0
    let skipped = 0

    const failOrCollect = (index: number, reason: string) => {
      if (!skipErrors) {
        throw new ErrorHandler(`Import thất bại tại dòng [${index}]: ${reason}`, 400)
      }
      errors.push({ index, reason })
      skipped += 1
    }

    const normalizeString = (raw: unknown) => String(raw ?? '').trim()

    for (let i = 0; i < listenings.length; i++) {
      const data = listenings[i]
      if (!data || typeof data !== 'object') {
        failOrCollect(i, 'Dữ liệu phải là object')
        continue
      }

      try {
        const title = normalizeString(data.title)
        if (!title) throw new Error('Thiếu hoặc rỗng "title"')

        const audioInput = data.audio ? normalizeString(data.audio) : undefined
        if (!audioInput) throw new Error('Audio (Media ID hoặc Link) thiếu')

        const audioId = await this.resolveMediaId(audioInput, userId)

        const description = normalizeString(data.description)
        if (!description) throw new Error('Thiếu hoặc rỗng "description"')

        const subtitle = normalizeString(data.subtitle)
        if (!subtitle) throw new Error('Thiếu hoặc rỗng "subtitle"')
        const subtitleVi = normalizeString(data.subtitleVi)
        if (!subtitleVi) throw new Error('Thiếu hoặc rỗng "subtitleVi"')
        this.validateSubtitlePair(subtitle, subtitleVi)
        const quiz = this.normalizeQuizInput(data.quiz ?? data.quizJson)

        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false
        const levelRaw = data.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        let existing = await Listening.findOne({ title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.description = description
          existing.audio = audioId
          existing.subtitle = subtitle
          existing.subtitleVi = subtitleVi
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.level = level
          existing.updatedBy = new mongoose.Types.ObjectId(userId)
          await existing.save()
          await this.replaceListeningQuizzesFromItems(String(existing._id), quiz)
          updated++
        } else {
          const createdListening = await Listening.create({
            title,
            description,
            audio: audioId,
            subtitle,
            subtitleVi,
            quizzes: [],
            isVipRequired,
            isActive,
            level,
            createdBy: new mongoose.Types.ObjectId(userId),
          })
          if (quiz.length) {
            await this.replaceListeningQuizzesFromItems(String(createdListening._id), quiz)
          }
          created++
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: listenings.length, skipped, errors }
  }

  // Helper xử lý Media ID hoặc URL (Chỉ chấp nhận Audio)
  private static async resolveMediaId(audioInput: string, userId: string): Promise<mongoose.Types.ObjectId> {
    const input = String(audioInput || '').trim();
    if (!input) throw new ErrorHandler('Thiếu thông tin media', 400);

    if (mongoose.Types.ObjectId.isValid(input)) {
      const media = await MediaService.getMediaById(input);
      if (media) return new mongoose.Types.ObjectId(input);
    }

    const urlPattern = /^(https?:\/\/)/i;
    if (urlPattern.test(input)) {
      try {
        // Fix: Use createAudioFromUrl instead of createVideoFromUrl
        const media = await MediaService.createVideoFromUrl(input, userId);
        return media._id as mongoose.Types.ObjectId;
      } catch (error: any) {
        throw new ErrorHandler(`Không thể xử lý URL audio: ${error.message}`, 400);
      }
    }

    throw new ErrorHandler(`Thông tin audio không hợp lệ: ${input}`, 400);
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy tất cả bài nghe (có phân trang & tìm kiếm)
  static async getAllListening(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    createdBy?: string
  }): Promise<IListeningPaginateResult> {
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
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { subtitleVi: { $regex: search, $options: 'i' } }
      ]
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
        { path: 'audio', select: 'url' },
        { path: 'createdBy', select: 'fullName email' },
        { path: 'updatedBy', select: 'fullName email' }
      ],
      lean: false,
      customLabels: {
        docs: 'listenings',
        totalDocs: 'total',
        limit: 'limit',
        page: 'page',
        totalPages: 'pages',
        hasNextPage: 'hasNext',
        hasPrevPage: 'hasPrev',
        nextPage: 'next',
        prevPage: 'prev'
      }
    }

    return await Listening.paginate(query, paginateOptions)
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài nghe
  static async updateMultipleListeningStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedListenings: IListening[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID bài nghe trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const listenings = await Listening.find({ _id: { $in: validIds } })

    if (listenings.length !== validIds.length) {
      throw new ErrorHandler(`Không tìm thấy một số bài nghe`, 404)
    }

    const result = await Listening.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedListenings = await Listening.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedListenings
    }
  }

  // (ADMIN) Xóa nhiều bài nghe
  static async deleteMultipleListening(ids: string[]): Promise<IListening[]> {
    const listeningsToDelete = await Listening.find({ _id: { $in: ids } })
    const deletedListenings = await Listening.deleteMany({ _id: { $in: ids } })
    if (!deletedListenings) throw new ErrorHandler('Không tìm thấy bài nghe để xóa', 404)
    const oidList = ids.map((id) => new mongoose.Types.ObjectId(id))
    await Quiz.deleteMany({ listeningId: { $in: oidList } })
    return listeningsToDelete as unknown as IListening[]
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách tất cả bài nghe kèm tiến độ của người dùng
  static async getListeningList(userId: string): Promise<IListening[]> {
    const getAllListening = await Listening.find({ isActive: true }).sort({ orderIndex: 1 })

    // Lấy bản ghi tốt nhất từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category: 'listening' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])
    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    return getAllListening.map((listening) => {
      const p = progressMap.get(String(listening._id))
      const listeningObj = listening.toObject()
      return {
        ...listeningObj,
        isCompleted: p?.status === 'passed',
        isActive: true,
        progress: p?.progress || 0,
        point: p?.progress || 0,
        isResult: !!(p && ((p.resultId && p.resultId.length > 0) || (p.progress || 0) > 0)),
        isVipRequired: listeningObj.isVipRequired !== undefined ? listeningObj.isVipRequired : true
      } as unknown as IListening
    })
  }

  // (USER / ADMIN) Lấy thông tin chi tiết bài nghe theo ID (trả `quiz` dạng mảng câu hỏi cho client)
  static async getListeningById(id: string): Promise<IListening> {
    await this.migrateLegacyQuizFromCollection(id)
    const listening = await Listening.findById(id)
      .populate({ path: 'audio', select: 'url' })
      .populate({ path: 'quizzes', model: 'Quiz' })
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const audioUrl = (listening.audio as any)?.url || null
    return this.formatListeningResponse(listening.toObject(), audioUrl) as unknown as IListening
  }

  // (ADMIN) Danh sách câu quiz của một bài nghe (document ListeningQuiz)
  static async getListeningQuizzes(listeningId: string) {
    const listening = await Listening.findById(listeningId).populate({ path: 'quizzes', model: 'Quiz' })
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    return listening.quizzes
  }

  static async addListeningQuiz(
    listeningId: string,
    item: { question: string; options: string[]; answer: string }
  ) {
    const listening = await Listening.findById(listeningId)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    const [normalized] = this.normalizeQuizInput([item])
    const orderIndex = await Quiz.countDocuments({ listeningId: listening._id })
    const doc = await Quiz.create({
      listeningId: listening._id,
      question: normalized.question,
      options: normalized.options,
      answer: normalized.answer,
      type: 'Multiple Choice',
      explanation: '',
      orderIndex,
    })
    await Listening.findByIdAndUpdate(listeningId, { $push: { quizzes: doc._id } })
    return doc
  }

  static async updateListeningQuizItem(
    listeningId: string,
    quizId: string,
    item: { question: string; options: string[]; answer: string }
  ) {
    const [normalized] = this.normalizeQuizInput([item])
    const doc = await Quiz.findOneAndUpdate(
      { _id: quizId, listeningId: new mongoose.Types.ObjectId(listeningId) },
      {
        $set: {
          question: normalized.question,
          options: normalized.options,
          answer: normalized.answer,
          type: 'Multiple Choice',
          explanation: '',
        },
      },
      { new: true }
    )
    if (!doc) throw new ErrorHandler('Không tìm thấy câu quiz', 404)
    return doc
  }

  static async deleteListeningQuizItem(listeningId: string, quizId: string): Promise<void> {
    const res = await Quiz.findOneAndDelete({
      _id: quizId,
      listeningId: new mongoose.Types.ObjectId(listeningId),
    })
    if (!res) throw new ErrorHandler('Không tìm thấy câu quiz', 404)
    await Listening.findByIdAndUpdate(listeningId, { $pull: { quizzes: new mongoose.Types.ObjectId(quizId) } })
  }

  // (USER) Nộp bài làm quiz bài nghe
  static async doListeningQuiz(
    userId: string,
    listeningId: string,
    dictationResults: { index: number, text: string, isCorrect: boolean }[],
    quizResults: IQuizResult[],
    studyTimeSeconds: number = 0,
  ) {
    // Kiểm tra listening
    const listening = await Listening.findById(listeningId)
    if (!listening) return new ErrorHandler('Bài nghe không tồn tại', 404)

    // Tạo mảng quizResult
    const quizResultIds = await QuizResult.create(quizResults)

    // Tạo listening progress
    const listeningProgress = await ListeningProgress.create({
      directionResults: dictationResults,
      quizzesResults: quizResultIds,
      studyTime: studyTimeSeconds,
    })

    // Progress 30% Quiz và 70% Dictionary
    const correctQuiz = quizResults.filter(r => r.isCorrect).length
    const correctDictation = dictationResults.filter(r => r.isCorrect).length

    const quizPercent = quizResults.length ? correctQuiz / quizResults.length : 0
    const dictationPercent = dictationResults.length ? correctDictation / dictationResults.length : 0

    const progressQuiz = quizPercent * 30
    const progressDictionary = dictationPercent * 70

    const progress = Math.round(progressQuiz + progressDictionary)

    // Tạo story history
    const history = await StudyService.saveStudyResult({
      userId: userId,
      lessonId: listeningId,
      category: 'listening',
      level: (listening as any).level || 'A1',
      progress: progress,
      isCompleted: false,
      studyTime: studyTimeSeconds,
      resultId: [listeningProgress._id as mongoose.Types.ObjectId],
      resultModel: 'ListeningProgress',
    })

    await StreakService.updateStreak(userId)
    return history
  }

  // (USER) Lấy kết quả bài nghe
  static async getListeningResult(userId: string, listeningId: string): Promise<IListeningResult> {
    const getListeningHistory = await StudyHistory.find({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(listeningId),
      category: 'listening'
    }).sort({ progress: -1, createdAt: -1 })
    const listening = await Listening.findById(listeningId)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    if (getListeningHistory.length === 0) throw new ErrorHandler('Bài nghe chưa được học', 404)
    const listengResultId = getListeningHistory[0]?.resultId

    if (!listengResultId || listengResultId.length === 0) throw new ErrorHandler('Bài nghe chưa được học', 404)

    const listeningResult = await ListeningProgress.findById(listengResultId).populate({ path: 'quizzesResults', model: 'QuizResult' })
    if (listeningResult === null) throw new ErrorHandler('Bài nghe chưa được học', 404)

    return {
      progress: getListeningHistory[0].progress,
      point: listeningResult.directionResults.filter(r => r.isCorrect).length,
      totalQuestions: listeningResult.directionResults.length,
      quizPoint: listeningResult.quizzesResults.filter(r => r.isCorrect).length,
      quizTotal: listeningResult.quizzesResults.length,
      quizProgress: listeningResult.quizzesResults.filter(r => r.isCorrect).length / listeningResult.quizzesResults.length * 100,
      time: getListeningHistory[0].duration,
      result: listeningResult.directionResults,
      listeningId: listening.toObject()
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo bài nghe mới
  static async createListening(listening: IListening): Promise<IListening> {
    if (listening.title) {
      const titleExist = await Listening.findOne({ title: listening.title.trim() });
      if (titleExist) throw new ErrorHandler('Tiêu đề bài nghe đã tồn tại', 400);
    }

    this.validateSubtitlePair((listening as any).subtitle, (listening as any).subtitleVi)
    const normalizedQuiz = this.normalizeQuizInput((listening as any).quiz)

    const last = await Listening.findOne().sort({ orderIndex: -1 })
    const nextOrderIndex = (last?.orderIndex || 0) + 1

    const created = await Listening.create({
      title: listening.title?.trim(),
      description: (listening as any).description,
      audio: new mongoose.Types.ObjectId(listening.audio),
      subtitle: (listening as any).subtitle,
      subtitleVi: (listening as any).subtitleVi,
      level: (listening as any).level || 'A1',
      isActive: (listening as any).isActive ?? false,
      isVipRequired: (listening as any).isVipRequired ?? true,
      createdBy: (listening as any).createdBy,
      updatedBy: (listening as any).updatedBy,
      quizzes: [],
      orderIndex: nextOrderIndex,
    })

    if (normalizedQuiz.length) {
      await this.replaceListeningQuizzesFromItems(String(created._id), normalizedQuiz)
    }

    const out = await this.getListeningById(String(created._id))
    return out
  }

  // (ADMIN) Cập nhật bài nghe
  static async updateListening(id: string, listening: IListening): Promise<IListening> {
    const existingListening = await Listening.findById(id).select('subtitle subtitleVi')
    if (!existingListening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    this.validateSubtitlePair(listening.subtitle, listening.subtitleVi)

    const audio = await Media.findById(listening.audio)
    if (!audio) throw new ErrorHandler('Media không tồn tại', 404)

    await existingListening.save()

    const listeningUpdated = await Listening.findByIdAndUpdate(
      id,
      { ...listening, quizzes: existingListening.quizzes },
      { new: true })

    return listeningUpdated as IListening
  }

  // (ADMIN) Xóa một bài nghe
  static async deleteListening(id: string): Promise<IListening> {
    const deletedListening = await Listening.findByIdAndDelete(id)
    if (!deletedListening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    await Quiz.deleteMany({ listeningId: new mongoose.Types.ObjectId(id) })
    return deletedListening
  }

  // (ADMIN) Thay đổi thứ tự bài nghe (Lên/Xuống)
  static async swapOrderIndex(listeningId: string, direction: 'up' | 'down'): Promise<{ currentListening: IListening; swappedListening: IListening }> {
    const currentListening = await Listening.findById(listeningId);
    if (!currentListening) throw new ErrorHandler('Bài nghe không tồn tại', 404);

    let adjacentListening: IListening | null = null;
    if (direction === 'up') {
      adjacentListening = await Listening.findOne({ orderIndex: { $lt: currentListening.orderIndex } })
        .sort({ orderIndex: -1 });
    } else {
      adjacentListening = await Listening.findOne({ orderIndex: { $gt: currentListening.orderIndex } })
        .sort({ orderIndex: 1 });
    }

    if (!adjacentListening) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = currentListening.orderIndex;
    const adjacentIndex = adjacentListening.orderIndex;

    const temp = Date.now();
    await Listening.updateOne({ _id: currentListening._id }, { orderIndex: temp });
    await Listening.updateOne({ _id: adjacentListening._id }, { orderIndex: currentIndex });
    await Listening.updateOne({ _id: currentListening._id }, { orderIndex: adjacentIndex });

    return {
      currentListening,
      swappedListening: adjacentListening
    };
  }

  // (ADMIN) Bật/tắt trạng thái xuất bản bài nghe
  static async updateListeningStatus(id: string): Promise<IListening> {
    const listening = await Listening.findById(id)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    listening.isActive = !listening.isActive
    await listening.save()
    return listening
  }

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài nghe
  static async toggleVipStatus(id: string): Promise<IListening> {
    const listening = await Listening.findById(id)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    listening.isVipRequired = !listening.isVipRequired
    await listening.save()
    return listening
  }
}
