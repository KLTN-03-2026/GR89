import mongoose, { ObjectId } from "mongoose"
import XLSX from 'xlsx'
import { IListening, Listening, IListeningPaginateResult } from "../models/listening.model"
import { ListeningQuiz } from "../models/listeningQuiz.model"
import ErrorHandler from "../utils/ErrorHandler"
import { StudyHistory } from '../models/studyHistory.model'
import { StudyService } from './study.service'
import { StreakService } from "./streak.service"
import { User } from "../models/user.model"
import { MediaService } from "./media.service"

export class ListeningService {
  private static normalizeQuizInput(rawQuiz: unknown): { question: string; options: string[]; answer: string }[] {
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

      return { question, options, answer }
    })
  }

  private static splitSentences(text: string): string[] {
    return String(text || '')
      .trim()
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  /** Chuẩn hoá dữ liệu trả về client: luôn có `quiz` (mảng câu hỏi), không phụ thuộc cách lưu DB */
  private static formatListeningResponse(listening: any, audioUrl: string | null) {
    const quizzesPopulated = listening.quizzes as any[] | undefined
    const quiz =
      Array.isArray(quizzesPopulated) && quizzesPopulated.length > 0 && typeof (quizzesPopulated[0] as any)?.question === 'string'
        ? quizzesPopulated.map((q: any) => ({
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer,
        }))
        : []
    const { quizzes: _q, quiz: _legacy, ...rest } = listening
    return {
      ...rest,
      audio: audioUrl,
      quiz,
    }
  }

  /** Legacy: bài cũ lưu `quiz` nhúng trong document Listening — migrate sang ListeningQuiz + quizzes[] */
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

  /** Xoá toàn bộ câu quiz của bài nghe và ghi lại từ mảng (import / cập nhật hàng loạt) */
  static async replaceListeningQuizzesFromItems(
    listeningId: string,
    items: { question: string; options: string[]; answer: string }[]
  ): Promise<void> {
    const lid = new mongoose.Types.ObjectId(listeningId)
    await ListeningQuiz.deleteMany({ listeningId: lid })
    if (!items.length) {
      await Listening.findByIdAndUpdate(listeningId, { quizzes: [] })
      await Listening.collection.updateOne({ _id: lid }, { $unset: { quiz: 1 } })
      return
    }
    const docs = await ListeningQuiz.insertMany(
      items.map((q, i) => ({
        listeningId: lid,
        question: q.question,
        options: q.options,
        answer: q.answer,
        orderIndex: i,
      }))
    )
    await Listening.findByIdAndUpdate(listeningId, {
      quizzes: docs.map((d) => d._id),
    })
    await Listening.collection.updateOne({ _id: lid }, { $unset: { quiz: 1 } })
  }

  private static validateSubtitlePair(subtitle: string, subtitleVi: string) {
    const enSentences = this.splitSentences(subtitle)
    const viSentences = this.splitSentences(subtitleVi)
    if (enSentences.length !== viSentences.length) {
      throw new ErrorHandler(
        `Số lượng câu subtitle tiếng Anh (${enSentences.length}) phải bằng subtitle tiếng Việt (${viSentences.length})`,
        400
      )
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
      const quizDocs = await ListeningQuiz.find({ listeningId: l._id }).sort({ orderIndex: 1 }).lean()
      const quizPayload = quizDocs.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
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
    await ListeningQuiz.deleteMany({ listeningId: { $in: oidList } })
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
      .populate({ path: 'quizzes', model: 'ListeningQuiz' })
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const audioUrl = (listening.audio as any)?.url || null
    return this.formatListeningResponse(listening.toObject(), audioUrl) as unknown as IListening
  }

  // (ADMIN) Danh sách câu quiz của một bài nghe (document ListeningQuiz)
  static async getListeningQuizzes(listeningId: string) {
    await this.migrateLegacyQuizFromCollection(listeningId)
    return ListeningQuiz.find({ listeningId: new mongoose.Types.ObjectId(listeningId) }).sort({ orderIndex: 1 })
  }

  static async addListeningQuiz(
    listeningId: string,
    item: { question: string; options: string[]; answer: string }
  ) {
    const listening = await Listening.findById(listeningId)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    const [normalized] = this.normalizeQuizInput([item])
    const orderIndex = await ListeningQuiz.countDocuments({ listeningId: listening._id })
    const doc = await ListeningQuiz.create({
      listeningId: listening._id,
      question: normalized.question,
      options: normalized.options,
      answer: normalized.answer,
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
    const doc = await ListeningQuiz.findOneAndUpdate(
      { _id: quizId, listeningId: new mongoose.Types.ObjectId(listeningId) },
      {
        $set: {
          question: normalized.question,
          options: normalized.options,
          answer: normalized.answer,
        },
      },
      { new: true }
    )
    if (!doc) throw new ErrorHandler('Không tìm thấy câu quiz', 404)
    return doc
  }

  static async deleteListeningQuizItem(listeningId: string, quizId: string): Promise<void> {
    const res = await ListeningQuiz.findOneAndDelete({
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
    time: number,
    result: { index: number, text: string, isCorrect: boolean }[],
    studyTimeSeconds: number = 0,
    mode: 'quiz' | 'dictation' = 'dictation'
  ) {
    const listening = await Listening.findById(listeningId)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const point = result.filter(r => r.isCorrect).length
    const totalQuestions = Array.isArray(result) ? result.length : 0
    const computedProgress = totalQuestions > 0
      ? Math.round(((point / totalQuestions) * 100) * 100) / 100
      : 0
    const progress = mode === 'quiz' ? 0 : computedProgress
    const sessionDuration = Math.max(0, studyTimeSeconds > 0 ? studyTimeSeconds : Number(time) || 0)

    // Lưu kết quả qua StudyService (Unified)
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: listeningId,
      category: 'listening',
      level: (listening as any).level || 'A1',
      progress,
      point,
      isCompleted: mode === 'dictation',
      studyTime: sessionDuration,
      resultData: { mode, answers: result },
      correctAnswers: point,
      totalQuestions
    })

    // Luôn cập nhật streak khi có tham gia làm bài
    await StreakService.update(userId);

    return history
  }

  // (USER) Lấy kết quả bài nghe
  static async getListeningResult(userId: string, listeningId: string): Promise<any> {
    const histories = await StudyHistory.find({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(listeningId),
      category: 'listening'
    }).sort({ createdAt: -1 })

    const parseMode = (history: any): 'quiz' | 'dictation' => {
      const raw = history?.resultData
      if (raw && typeof raw === 'object' && raw.mode === 'quiz') return 'quiz'
      return 'dictation'
    }

    const parseAnswers = (history: any): any[] => {
      const raw = history?.resultData
      if (Array.isArray(raw)) return raw
      if (raw && typeof raw === 'object' && Array.isArray(raw.answers)) return raw.answers
      return []
    }

    const latestQuizHistory = histories.find((h: any) => parseMode(h) === 'quiz')
    const latestDictationHistory = histories.find((h: any) => parseMode(h) === 'dictation')
    const history = latestDictationHistory || histories[0]

    if (!history) throw new ErrorHandler('Kết quả bài nghe không tồn tại', 404)

    await this.migrateLegacyQuizFromCollection(listeningId)
    const listening = await Listening.findById(listeningId)
      .populate({ path: 'audio', select: 'url' })
      .populate({ path: 'quizzes', model: 'ListeningQuiz' })
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const rawResult = parseAnswers(history as any)
    const detailResult = rawResult.filter(
      (item: any) =>
        item &&
        typeof item.index === 'number' &&
        typeof item.text === 'string' &&
        typeof item.isCorrect === 'boolean'
    )
    const computedPoint = detailResult.filter((item: any) => item.isCorrect).length
    const computedProgress = detailResult.length > 0
      ? Math.round((computedPoint / detailResult.length) * 10000) / 100
      : Number((history as any).progress || 0)
    const quizPoint = latestQuizHistory ? Number((latestQuizHistory as any).correctAnswers || 0) : 0
    const quizTotal = latestQuizHistory ? Number((latestQuizHistory as any).totalQuestions || 0) : 0
    const quizProgress = quizTotal > 0
      ? Math.round((quizPoint / quizTotal) * 10000) / 100
      : 0

    const audioUrl = ((listening as any).audio as any)?.url || null

    return {
      progress: computedProgress,
      point: computedPoint,
      totalQuestions: detailResult.length,
      quizPoint,
      quizTotal,
      quizProgress,
      time: Number((history as any).duration || 0),
      date: (history as any).createdAt,
      result: detailResult,
      listeningId: this.formatListeningResponse((listening as any).toObject(), audioUrl),
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
    const updatePayload: any = { ...(listening as any) }
    delete updatePayload.quiz
    delete updatePayload.quizzes

    const existing = await Listening.findById(id).select('subtitle subtitleVi')
    if (!existing) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const finalSubtitle = typeof updatePayload.subtitle === 'string' ? updatePayload.subtitle : (existing as any).subtitle
    const finalSubtitleVi = typeof updatePayload.subtitleVi === 'string' ? updatePayload.subtitleVi : (existing as any).subtitleVi
    this.validateSubtitlePair(finalSubtitle, finalSubtitleVi)

    if (listening && (listening as any).audio) {
      try {
        updatePayload.audio = new mongoose.Types.ObjectId((listening as any).audio)
      } catch {
        throw new ErrorHandler('ID Media không hợp lệ', 400)
      }
    }

    await Listening.findByIdAndUpdate(id, updatePayload, { new: true })

    if (Object.prototype.hasOwnProperty.call(listening as any, 'quiz')) {
      const items = this.normalizeQuizInput((listening as any).quiz)
      await this.replaceListeningQuizzesFromItems(id, items)
    }

    return await this.getListeningById(id)
  }

  // (ADMIN) Xóa một bài nghe
  static async deleteListening(id: string): Promise<IListening> {
    const deletedListening = await Listening.findByIdAndDelete(id)
    if (!deletedListening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    await ListeningQuiz.deleteMany({ listeningId: new mongoose.Types.ObjectId(id) })
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
