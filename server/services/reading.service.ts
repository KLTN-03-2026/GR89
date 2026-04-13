import mongoose from "mongoose"
import { IQuiz, Quiz } from "../models/quiz.model"
import { IReading, Reading, IReadingPaginateResult, IVocabularyReading } from "../models/reading.model"
import ErrorHandler from "../utils/ErrorHandler"
import { StudyHistory } from "../models/studyHistory.model"
import { StudyService } from "./study.service"
import { shuffle } from "../utils/shuffle.util"
import { IQuizResult, QuizResult } from "../models/quizzResult.model"
import XLSX from 'xlsx'
import { MediaService } from "./media.service"
import { StreakService } from "./streak.service"
import { User } from "../models/user.model"

interface QuizResult {
  question: string
  userAnswer: string
  isCorrect: boolean
  questionNumber: number
  answer: string
}

export class ReadingService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về Reading
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await Reading.countDocuments();
    const activeLessons = await Reading.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await StudyHistory.countDocuments({ category: 'reading' });
    const completedProgressRecords = await StudyHistory.countDocuments({ category: 'reading', status: 'passed' });

    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await StudyHistory.countDocuments({
      category: 'reading',
      createdAt: { $gte: currentMonth }
    })

    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await StudyHistory.countDocuments({
      category: 'reading',
      createdAt: {
        $gte: lastMonth,
        $lt: currentMonth
      }
    })

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

  // (ADMIN) Xuất dữ liệu Reading ra file Excel
  static async exportReadingData(): Promise<Buffer> {
    const readings = await Reading.find()
      .populate('image')
      .populate('quizzes')
      .sort({ orderIndex: 1 })
      .lean()

    const readingsRows: any[][] = [['ID', 'title', 'description', 'level', 'paragraphEn', 'paragraphVi', 'imageID', 'isActive', 'isVipRequired', 'orderIndex']]
    const vocabRows: any[][] = [['ReadingID', 'word', 'phonetic', 'definition', 'vietnamese', 'example']]
    const quizzesRows: any[][] = [['ReadingID', 'question', 'type', 'options (separated by |)', 'answer', 'explanation']]

    for (const r of (readings as any[])) {
      readingsRows.push([
        String(r._id || ''),
        r.title ?? '',
        r.description ?? '',
        r.level || 'A1',
        r.paragraphEn ?? '',
        r.paragraphVi ?? '',
        r.image?._id?.toString() ?? '',
        r.isActive ? 'true' : 'false',
        r.isVipRequired ? 'true' : 'false',
        r.orderIndex ?? ''
      ])

      if (r.vocabulary) {
        r.vocabulary.forEach((v: any) => {
          vocabRows.push([
            String(r._id || ''),
            v.word ?? '',
            v.phonetic ?? '',
            v.definition ?? '',
            v.vietnamese ?? '',
            v.example ?? ''
          ])
        })
      }

      if (r.quizzes) {
        r.quizzes.forEach((q: any) => {
          const optionsStr = Array.isArray(q.options) ? q.options.join('|') : ''
          quizzesRows.push([
            String(r._id || ''),
            q.question ?? '',
            q.type ?? '',
            optionsStr,
            q.answer ?? '',
            q.explanation ?? ''
          ])
        })
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(readingsRows), 'Readings')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(vocabRows), 'Vocabulary')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(quizzesRows), 'Quizzes')

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }


  // (ADMIN) Import dữ liệu Reading từ JSON
  static async importReadingFromJson(options: {
    readings: IReading[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { readings, userId, skipErrors } = options
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

    for (let i = 0; i < readings.length; i++) {
      const data = readings[i]
      if (!data || typeof data !== 'object') {
        failOrCollect(i, 'Dữ liệu phải là object')
        continue
      }

      try {
        const title = normalizeString(data.title)
        if (!title) throw new Error('Thiếu hoặc rỗng "title"')

        const imageInput = data.image ? normalizeString(data.image) : undefined
        const imageId = imageInput ? await this.resolveMediaId(imageInput, userId) : undefined

        const description = normalizeString(data.description)
        const paragraphEn = normalizeString(data.paragraphEn)
        const paragraphVi = normalizeString(data.paragraphVi)

        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false
        const levelRaw = data.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        const quizzesInput = Array.isArray(data.quizzes) ? data.quizzes : []
        const vocabularyInput = Array.isArray(data.vocabulary) ? data.vocabulary : []

        // Validate quizzes
        const normalizedQuizzes = quizzesInput.map((q: any, j: number) => {
          if (!q.question) throw new Error(`Quiz [${j}] thiếu "question"`)
          if (!q.answer) throw new Error(`Quiz [${j}] thiếu "answer"`)
          return {
            question: normalizeString(q.question),
            options: Array.isArray(q.options) ? q.options.map((o: any) => normalizeString(o)) : [],
            answer: normalizeString(q.answer),
            type: normalizeString(q.type || 'Multiple Choice'),
            explanation: normalizeString(q.explanation || '')
          }
        })

        // Validate vocabulary
        const normalizedVocab = vocabularyInput.map((v: any, j: number) => {
          if (!v.word) throw new Error(`Vocabulary [${j}] thiếu "word"`)
          return {
            word: normalizeString(v.word),
            phonetic: normalizeString(v.phonetic),
            definition: normalizeString(v.definition),
            vietnamese: normalizeString(v.vietnamese),
            example: normalizeString(v.example)
          }
        })

        let existing = await Reading.findOne({ title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.description = description
          existing.paragraphEn = paragraphEn
          existing.paragraphVi = paragraphVi
          if (imageId) existing.image = imageId as any
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.level = level
          existing.updatedBy = new mongoose.Types.ObjectId(userId)
          existing.vocabulary = normalizedVocab

          await Quiz.deleteMany({ _id: { $in: existing.quizzes } })

          const quizDocs = await Quiz.insertMany(normalizedQuizzes)

          existing.quizzes = quizDocs.map(q => q._id as any)

          await existing.save()
          updated++
        } else {
          const newReading = new Reading({
            title,
            description,
            paragraphEn,
            paragraphVi,
            image: imageId,
            isVipRequired,
            isActive,
            level,
            vocabulary: normalizedVocab,
            createdBy: new mongoose.Types.ObjectId(userId)
          })

          const quizDocs = await Quiz.insertMany(normalizedQuizzes)
          newReading.quizzes = quizDocs.map(q => q._id as any)

          await newReading.save()
          created++
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: readings.length, skipped, errors }
  }

  // Helper xử lý Media ID hoặc URL (Chỉ chấp nhận Image)
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

  // (ADMIN) Lấy tất cả bài đọc (có phân trang & tìm kiếm)
  static async getAllReadingPaginated(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    createdBy?: string
  }): Promise<IReadingPaginateResult> {
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
        { paragraphEn: { $regex: search, $options: 'i' } },
        { paragraphVi: { $regex: search, $options: 'i' } }
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
        { path: 'createdBy', select: 'fullName email' },
        { path: 'updatedBy', select: 'fullName email' },
        { path: 'image', select: '_id url' },
        { path: 'quizzes', select: 'question options correctAnswer' }
      ],
      lean: false,
      customLabels: {
        docs: 'readings',
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

    return await Reading.paginate(query, paginateOptions)
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài đọc
  static async updateMultipleReadingStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedReadings: IReading[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID bài đọc trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const readings = await Reading.find({ _id: { $in: validIds } })

    if (readings.length !== validIds.length) {
      throw new ErrorHandler(`Không tìm thấy một số bài đọc`, 404)
    }

    const result = await Reading.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedReadings = await Reading.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedReadings: updatedReadings as unknown as IReading[]
    }
  }

  // (ADMIN) Xóa nhiều bài đọc
  static async deleteMultipleReading(ids: string[]) {
    const deletedReadings = await Reading.deleteMany({ _id: { $in: ids } })
    if (!deletedReadings) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    return deletedReadings
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  static async getReadingByUser(userId: string): Promise<IReading[]> {
    return this.getReadingListByUser(userId)
  }

  // (USER) Lấy danh sách bài đọc kèm tiến độ của người dùng
  static async getReadingListByUser(userId: string): Promise<IReading[]> {
    const readings = await Reading.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .populate({ path: 'image', select: '_id url' });

    // Lấy bản ghi tốt nhất từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category: 'reading' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])
    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    return readings.map((reading) => {
      const p = progressMap.get(String(reading._id))
      const readingObj = reading.toObject()
      return {
        ...readingObj,
        isCompleted: p?.status === 'passed',
        isActive: true,
        progress: p?.progress || 0,
        point: p?.progress || 0,
        isResult: !!(p && ((p.resultId && p.resultId.length > 0) || (p.progress || 0) > 0)),
        isVipRequired: readingObj.isVipRequired !== undefined ? readingObj.isVipRequired : true
      } as unknown as IReading
    })
  }

  // (USER/ALL) Lấy thông tin bài đọc theo ID
  static async getReadingById(id: string) {
    const reading = await Reading.findById(id).populate('quizzes image')
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    return reading
  }

  // (USER) Nộp bài kiểm tra bài đọc
  static async doQuizReading(
    readingId: string,
    userId: string,
    quizResults: IQuizResult[],
    studyTimeSeconds: number = 0
  ): Promise<any> {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)

    // Lưu kết quả Quiz vào DB để lấy ID
    const createdResults = await QuizResult.insertMany(quizResults);
    const resultId = createdResults.map(d => d._id as mongoose.Types.ObjectId);

    const correctCount = quizResults.filter(r => r.isCorrect).length
    const point = correctCount // Điểm là số câu đúng
    const progress = Math.round(((correctCount / (quizResults.length || 1)) * 100) * 100) / 100

    // Lấy tags của các câu sai để làm weakPoints
    // const incorrectQuizzes = await Quiz.find({ _id: { $in: quizResults.filter(r => !r.isCorrect).map(r => r.quizId) } }).select('tags')
    const weakPoints = Array.from([])

    // Lưu qua StudyService (Unified)
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: readingId,
      category: 'reading',
      level: (reading as any).level || 'A1',
      progress,
      point,
      isCompleted: true, // Chỉ cần có làm là tính hoàn thành
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

  static async doReadingQuiz(readingId: string, userId: string, quizResults: IQuizResult[], studyTimeSeconds: number = 0): Promise<any> {
    return this.doQuizReading(readingId, userId, quizResults, studyTimeSeconds)
  }

  // (USER) Lấy kết quả bài đọc
  static async getReadingResult(userId: string, readingId: string): Promise<any> {
    const history = await StudyHistory.findOne({
      lessonId: new mongoose.Types.ObjectId(readingId),
      userId: new mongoose.Types.ObjectId(userId),
      category: 'reading'
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

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo bài đọc mới
  static async createReading(reading: IReading) {
    if (reading.title) {
      const titleExist = await Reading.findOne({ title: reading.title.trim() });
      if (titleExist) throw new ErrorHandler('Tiêu đề bài đọc đã tồn tại', 400);
    }

    const payload: any = { ...reading }
    if ((payload as any).image && typeof (payload as any).image === 'string') {
      payload.image = new mongoose.Types.ObjectId((payload as any).image)
    }
    if (payload.title) {
      payload.title = payload.title.trim()
    }

    const last = await Reading.findOne().sort({ orderIndex: -1 })
    payload.orderIndex = (last?.orderIndex || 0) + 1

    return await Reading.create(payload)
  }

  // (ADMIN) Cập nhật bài đọc
  static async updateReading(id: string, reading: IReading) {
    const payload: any = { ...reading }
    if ((payload as any).image && typeof (payload as any).image === 'string') {
      payload.image = new mongoose.Types.ObjectId(payload.image)
    }
    const updatedReading = await Reading.findByIdAndUpdate(id, payload, { new: true })
    if (!updatedReading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    return updatedReading
  }

  // (ADMIN) Xóa một bài đọc
  static async deleteReading(id: string) {
    const deletedReading = await Reading.findByIdAndDelete(id)
    if (!deletedReading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    return deletedReading
  }

  // (ADMIN) Bật/tắt trạng thái xuất bản bài đọc
  static async updateReadingStatus(id: string) {
    const reading = await Reading.findById(id)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    reading.isActive = !reading.isActive
    await reading.save()
    return reading
  }

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài đọc
  static async toggleVipStatus(id: string) {
    const reading = await Reading.findById(id)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    reading.isVipRequired = !reading.isVipRequired
    await reading.save()
    return reading
  }

  // (ADMIN) Thay đổi thứ tự bài đọc (Lên/Xuống)
  static async swapOrderIndex(readingId: string, direction: 'up' | 'down'): Promise<{ currentReading: IReading; swappedReading: IReading }> {
    const currentReading = await Reading.findById(readingId);
    if (!currentReading) throw new ErrorHandler('Bài đọc không tồn tại', 404);

    let adjacentReading: IReading | null = null;
    if (direction === 'up') {
      adjacentReading = await Reading.findOne({ orderIndex: { $lt: currentReading.orderIndex } })
        .sort({ orderIndex: -1 });
    } else {
      adjacentReading = await Reading.findOne({ orderIndex: { $gt: currentReading.orderIndex } })
        .sort({ orderIndex: 1 });
    }

    if (!adjacentReading) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = currentReading.orderIndex;
    const adjacentIndex = adjacentReading.orderIndex;

    const temp = Date.now();
    await Reading.updateOne({ _id: currentReading._id }, { orderIndex: temp });
    await Reading.updateOne({ _id: adjacentReading._id }, { orderIndex: currentIndex });
    await Reading.updateOne({ _id: currentReading._id }, { orderIndex: adjacentIndex });

    return {
      currentReading,
      swappedReading: adjacentReading
    };
  }

  // (ADMIN) Thêm quiz vào bài đọc
  static async createQuiz(readingId: string, quiz: IQuiz) {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    const newQuiz = await Quiz.create(quiz)
    reading.quizzes.push(newQuiz._id as unknown as mongoose.Types.ObjectId)
    await reading.save()
    return reading
  }

  // (ADMIN) Xóa quiz khỏi bài đọc
  static async deleteQuiz(readingId: string, quizId: string) {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    reading.quizzes = reading.quizzes.filter((quiz) => quiz.toString() !== quizId)
    await reading.save()
    await Quiz.findByIdAndDelete(quizId)
    return reading
  }

  // (ADMIN) Thêm từ vựng vào bài đọc
  static async createVocabulary(readingId: string, vocabulary: IVocabularyReading) {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)

    reading.vocabulary.push(vocabulary)
    await reading.save()
    return reading
  }

  // (ADMIN) Cập nhật từ vựng trong bài đọc
  static async updateVocabulary(readingId: string, vocabularyId: string, vocabulary: IVocabularyReading) {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)

    const vocabIndex = reading.vocabulary.findIndex(v => v._id?.toString() === vocabularyId)
    if (vocabIndex === -1) throw new ErrorHandler('Từ vựng không tồn tại trong bài đọc này', 404)

    reading.vocabulary[vocabIndex] = { ...vocabulary, _id: new mongoose.Types.ObjectId(vocabularyId) } as any
    await reading.save()
    return reading
  }

  // (ADMIN) Xóa từ vựng khỏi bài đọc
  static async deleteVocabulary(vocabularyId: string, readingId: string) {
    const reading = await Reading.findById(readingId)
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)

    reading.vocabulary = reading.vocabulary.filter((v) => v._id?.toString() !== vocabularyId)
    await reading.save()

    return reading
  }

  // (ADMIN) Lấy danh sách quiz của bài đọc
  static async getQuizByReading(readingId: string): Promise<IQuiz[]> {
    const reading = await Reading.findById(readingId).populate('quizzes')
    if (!reading) throw new ErrorHandler('Bài đọc không tồn tại', 404)
    return shuffle(reading.quizzes as unknown as IQuiz[]);
  }
}