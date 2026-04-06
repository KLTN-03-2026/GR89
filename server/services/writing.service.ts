import { IWriting, writingModel, IWritingPaginateResult } from "../models/writing.model";
import { UserProgress } from "../models/userProgress.model";
import { StudyHistory } from "../models/studyHistory.model";
import { StudyService } from "./study.service";
import { AIProvider } from "../providers/ai.provider";
import ErrorHandler from "../utils/ErrorHandler";
import mongoose from "mongoose";
import XLSX from 'xlsx'
import { StreakService } from "./streak.service";
import { User } from "../models/user.model";

const countWords = (text: string) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export interface IAIWritingResult {
  content: string
  revisedContent: string
  rubricContent: {
    point: number
    feedback: string[]
  }
  rubricStructure: {
    point: number
    feedback: string[]
  }
  rubricGrammar: {
    point: number
    feedback: string[]
  }
  rubricVocabulary: {
    point: number
    feedback: string[]
  }
  overallFeedback: string
  suggested: string[]
}

export class WritingService {
  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài viết có phân trang
  static async getAllWritingPaginated(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    createdBy?: string
  }): Promise<IWritingPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = options

    // Xây dựng query
    const query: any = {}

    // Tìm kiếm văn bản
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Lọc theo trạng thái hoạt động
    if (isActive !== undefined) {
      query.isActive = isActive
    }

    // Lọc theo người tạo
    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy)
    }

    // Xây dựng sort
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Cấu hình phân trang
    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        {
          path: 'createdBy',
          select: 'fullName email'
        },
        {
          path: 'updatedBy',
          select: 'fullName email'
        }
      ],
      lean: false, // Trả về full mongoose documents
      customLabels: {
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

    const result = await writingModel.paginate(query, paginateOptions)
    return result
  }

  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Import dữ liệu bài viết từ JSON
  static async importWritingFromJson(options: {
    writings: IWriting[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { writings, userId, skipErrors } = options
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

    for (let i = 0; i < writings.length; i++) {
      const data = writings[i]
      if (!data || typeof data !== 'object') {
        failOrCollect(i, 'Dữ liệu phải là object')
        continue
      }

      try {
        const title = normalizeString(data.title)
        if (!title) throw new Error('Thiếu hoặc rỗng "title"')

        const description = normalizeString(data.description)
        if (!description) throw new Error('Thiếu hoặc rỗng "description"')

        const minWords = Number(data.minWords || 0)
        const maxWords = Number(data.maxWords || 0)
        const duration = Number(data.duration || 0)

        if (isNaN(minWords) || minWords <= 0) throw new Error('minWords không hợp lệ')
        if (isNaN(maxWords) || maxWords <= 0) throw new Error('maxWords không hợp lệ')
        if (isNaN(duration) || duration <= 0) throw new Error('duration không hợp lệ')

        const suggestedVocabulary = Array.isArray(data.suggestedVocabulary)
          ? data.suggestedVocabulary.map((v) => normalizeString(v)).filter(Boolean)
          : []

        const suggestedStructure = Array.isArray(data.suggestedStructure)
          ? data.suggestedStructure.map((s: any, j: number) => {
            if (!s.title) throw new Error(`Structure [${j}] thiếu title`)
            return {
              title: normalizeString(s.title),
              description: normalizeString(s.description),
              step: Number(s.step || j + 1)
            }
          })
          : []

        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false
        const levelRaw = data.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        let existing = await writingModel.findOne({ title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.description = description
          existing.minWords = minWords
          existing.maxWords = maxWords
          existing.duration = duration
          existing.suggestedVocabulary = suggestedVocabulary
          existing.suggestedStructure = suggestedStructure
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.level = level
          existing.updatedBy = new mongoose.Types.ObjectId(userId)
          await existing.save()
          updated++
        } else {
          await writingModel.create({
            title,
            description,
            minWords,
            maxWords,
            duration,
            suggestedVocabulary,
            suggestedStructure,
            isVipRequired,
            isActive,
            level,
            createdBy: new mongoose.Types.ObjectId(userId)
          })
          created++
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: writings.length, skipped, errors }
  }

  // (ADMIN) Xuất dữ liệu bài viết ra file Excel
  static async exportWritingData(): Promise<Buffer> {
    const writings = await writingModel.find().sort({ orderIndex: 1 }).lean()
    const rows: any[][] = [[
      'writingId', 'title', 'description', 'level', 'minWords', 'maxWords', 'duration', 'suggestedVocabulary', 'suggestedStructure JSON', 'isActive', 'orderIndex'
    ]]
    for (const w of writings as any[]) {
      rows.push([
        String(w._id), w.title || '', w.description || '', w.level || 'A1', w.minWords ?? '', w.maxWords ?? '', w.duration ?? '',
        Array.isArray(w.suggestedVocabulary) ? w.suggestedVocabulary.join(' | ') : '',
        JSON.stringify(w.suggestedStructure || []),
        !!w.isActive,
        w.orderIndex ?? ''
      ])
    }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Writings')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }


  // (ADMIN) Lấy thống kê tổng quan về Writing
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await writingModel.countDocuments();
    const activeLessons = await UserProgress.countDocuments({ category: 'writing', isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await UserProgress.countDocuments({ category: 'writing' });
    const completedProgressRecords = await UserProgress.countDocuments({ category: 'writing', isCompleted: true });

    // Tính tỷ lệ hoàn thành
    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    // Tính lượt học tháng này
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await UserProgress.countDocuments({
      category: 'writing',
      updatedAt: { $gte: currentMonth }
    })

    // Tính lượt học tháng trước để so sánh
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await UserProgress.countDocuments({
      category: 'writing',
      updatedAt: {
        $gte: lastMonth,
        $lt: currentMonth
      }
    })

    // Tính phần trăm thay đổi
    const monthlyChange = lastMonthLearns > 0
      ? Math.round(((monthlyLearns - lastMonthLearns) / lastMonthLearns) * 100)
      : monthlyLearns > 0 ? 100 : 0

    // Tính điểm trung bình
    const avgWritingScore = await UserProgress.aggregate([
      { $match: { category: 'writing', point: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$point' } } }
    ]);

    return {
      totalLessons,
      activeLessons,
      totalUsers,
      completionRate,
      monthlyLearns,
      monthlyChange,
      avgWritingScore: Math.round(avgWritingScore[0]?.avgScore || 0),
      completedProgressRecords,
      totalProgressRecords
    };
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  static async getAllWritingByUser(userId: string): Promise<IWriting[]> {
    return this.getWritingListByUser(userId)
  }

  // (USER) Lấy danh sách bài viết kèm tiến độ của người dùng
  static async getWritingListByUser(userId: string): Promise<IWriting[]> {
    const writings = await writingModel.find({ isActive: true }).sort({ orderIndex: 1 });

    // Tự động mở bài đầu tiên
    const firstWriting = await writingModel.findOne({ isActive: true }).sort({ orderIndex: 1 })
    if (firstWriting) {
      const exists = await UserProgress.findOne({ userId, lessonId: firstWriting._id, category: 'writing' })
      if (!exists) {
        await UserProgress.create({
          userId,
          lessonId: firstWriting._id,
          category: 'writing',
          isActive: true,
          isCompleted: false,
          progress: 0
        })
      }
    }

    const progresses = await UserProgress.find({ userId, category: 'writing' })
    const progressMap = new Map(progresses.map(p => [String(p.lessonId), p]))

    return writings.map((writing) => {
      const p = progressMap.get(String(writing._id));
      const writingObj = writing.toObject()
      return {
        ...writingObj,
        isCompleted: p?.isCompleted || false,
        isActive: p?.isActive || false,
        progress: p?.progress || 0,
        point: p?.point || 0,
        isResult: !!(p && (((p as any).resultData && Object.keys((p as any).resultData).length > 0) || (p.point || 0) > 0)),
        isVipRequired: writingObj.isVipRequired !== undefined ? writingObj.isVipRequired : true,
      } as unknown as IWriting;
    });
  }

  // (USER/ALL) Lấy thông tin bài viết theo ID
  static async getWritingById(writingId: string) {
    const writing = await writingModel.findOne({ _id: writingId })
    if (!writing) throw new ErrorHandler('Bài viết không tồn tại', 404)
    return writing
  }

  // (USER) Lấy tiến độ của người dùng theo ID bài viết
  static async getUserProgress(userId: string, writingId: string) {
    return await UserProgress.findOne({ userId, lessonId: writingId, category: 'writing' })
  }

  // (USER) AI chấm điểm và đánh giá bài viết
  static async evaluateWriting(
    writingId: string,
    content: string,
    userId: string,
    studyTimeSeconds: number = 0
  ) {
    const writing = await writingModel.findById(writingId)
    if (!writing) throw new ErrorHandler('Bài viết không tồn tại', 404)

    const wordCount = countWords(content)
    if (wordCount < writing.minWords) {
      throw new ErrorHandler(`Bài viết quá ngắn. Cần tối thiểu ${writing.minWords} từ.`, 400)
    }

    const systemPrompt = `
      You are an experienced English researcher with 20 years of expertise and also a top-level English teacher.
      Your task is to evaluate students' essays and return ONLY valid JSON.
      All feedback, comments, and suggestions must be written in VIETNAMESE language.
      Do not include explanations outside of the JSON.
      `;

    const userPrompt = `
      Topic: ${writing.description}
      Essay: ${content}
      
      Essay Requirements:
      - Minimum words: ${writing.minWords}
      - Maximum words: ${writing.maxWords}
      - Duration: ${writing.duration} minutes
      - Suggested vocabulary: ${writing.suggestedVocabulary.join(', ')}
      - Suggested structure: ${writing.suggestedStructure.map(s => `${s.step}. ${s.title}: ${s.description}`).join(' | ')}

      Requirements:
      1. Return the result strictly in this JSON format:
      {
        "content": "string",
        "revisedContent": "string",
        "rubricContent": { "point": number, "feedback": ["string"] },
        "rubricStructure": { "point": number, "feedback": ["string"] },
        "rubricGrammar": { "point": number, "feedback": ["string"] },
        "rubricVocabulary": { "point": number, "feedback": ["string"] },
        "overallFeedback": "string",
        "suggested": ["string"]
      }
      `;

    const result = await AIProvider.evaluateEssay<IAIWritingResult>(systemPrompt, userPrompt)
    const pointResult = (result.rubricContent.point + result.rubricStructure.point + result.rubricGrammar.point + result.rubricVocabulary.point) / 4

    // Lưu qua StudyService
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: writingId,
      category: 'writing',
      level: (writing as any).level || 'A1',
      progress: pointResult,
      point: pointResult,
      isCompleted: true, // Chỉ cần có làm là tính hoàn thành
      studyTime: studyTimeSeconds,
      resultData: result,
      correctAnswers: 1,
      totalQuestions: 1
    })

    // Luôn cập nhật streak khi có tham gia làm bài
    await StreakService.update(userId)

    return result
  }

  // (USER) Lấy kết quả bài viết
  static async getWritingResult(userId: string, writingId: string): Promise<any> {
    const progress = await UserProgress.findOne({ userId, lessonId: writingId, category: 'writing' })
    const history = await StudyHistory.findOne({ userId, lessonId: writingId, category: 'writing' }).sort({ createdAt: -1 })

    if (!progress) throw new ErrorHandler('Kết quả bài viết không tồn tại', 404)

    return {
      ...progress.toObject(),
      result: history?.resultData || null
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo bài viết mới
  static async createWriting(writing: IWriting): Promise<IWriting> {
    // Kiểm tra title đã tồn tại chưa
    if (writing.title) {
      const titleExist = await writingModel.findOne({ title: writing.title.trim() });
      if (titleExist) throw new ErrorHandler('Chủ đề writing đã tồn tại', 400);
    }

    const orderIndex = await writingModel.countDocuments()
    const newWriting = await writingModel.create({
      ...writing,
      title: writing.title?.trim(),
      orderIndex
    })
    return newWriting
  }

  // (ADMIN) Cập nhật bài viết
  static async updateWriting(writingId: string, writing: IWriting) {
    const updatedWriting = await writingModel.findByIdAndUpdate(writingId, writing, { new: true })
    return updatedWriting
  }

  // (ADMIN) Xóa một bài viết theo ID
  static async deleteWriting(writingId: string) {
    const deletedWriting = await writingModel.findByIdAndDelete(writingId)
    return deletedWriting
  }

  // (ADMIN) Xóa nhiều bài viết
  static async deleteMultipleWriting(writingIds: string[]) {
    const deletedWritings = await writingModel.deleteMany({ _id: { $in: writingIds } })
    return deletedWritings
  }

  // (ADMIN) Bật/tắt trạng thái VIP cho bài viết
  static async toggleVipStatus(writingId: string) {
    const writing = await writingModel.findById(writingId)
    if (!writing) throw new ErrorHandler('Writing không tồn tại', 404)
    writing.isVipRequired = !writing.isVipRequired
    await writing.save()
    return writing
  }

  // (ADMIN) Thay đổi thứ tự bài viết (Lên/Xuống)
  static async swapOrderIndex(writingId: string, direction: 'up' | 'down'): Promise<{ currentWriting: IWriting; swappedWriting: IWriting }> {
    const currentWriting = await writingModel.findById(writingId);
    if (!currentWriting) throw new ErrorHandler('Writing không tồn tại', 404);

    let adjacentWriting: IWriting | null = null;
    if (direction === 'up') {
      adjacentWriting = await writingModel.findOne({ orderIndex: { $lt: currentWriting.orderIndex } })
        .sort({ orderIndex: -1 });
    } else {
      adjacentWriting = await writingModel.findOne({ orderIndex: { $gt: currentWriting.orderIndex } })
        .sort({ orderIndex: 1 });
    }

    if (!adjacentWriting) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = currentWriting.orderIndex;
    const adjacentIndex = adjacentWriting.orderIndex;

    const temp = Date.now();

    // B1: đẩy current ra ngoài
    await writingModel.updateOne(
      { _id: currentWriting._id },
      { orderIndex: temp }
    );

    // B2: cập nhật adjacent
    await writingModel.updateOne(
      { _id: adjacentWriting._id },
      { orderIndex: currentIndex }
    );

    // B3: cập nhật current
    await writingModel.updateOne(
      { _id: currentWriting._id },
      { orderIndex: adjacentIndex }
    );

    return {
      currentWriting,
      swappedWriting: adjacentWriting
    };
  }

  // (ADMIN) Bật/tắt trạng thái hoạt động của bài viết
  static async updateWritingStatus(writingId: string) {
    const writing = await writingModel.findById(writingId)

    if (!writing) throw new ErrorHandler('Bài viết không tồn tại', 404)

    writing.isActive = !writing.isActive

    await writing.save()
    return writing
  }

  // (ADMIN) Cập nhật trạng thái hoạt động cho nhiều bài viết
  static async updateMultipleWritingStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedWritings: IWriting[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID bài viết trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const writings = await writingModel.find({ _id: { $in: validIds } })

    if (writings.length !== validIds.length) {
      const foundIds = writings.map(item => String(item._id))
      const missingIds = validIds.filter(id => !foundIds.includes(id))
      throw new ErrorHandler(`Không tìm thấy ${missingIds.length} bài viết với ID: ${missingIds.join(', ')}`, 404)
    }

    const result = await writingModel.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedWritings = await writingModel.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedWritings: updatedWritings as unknown as IWriting[]
    }
  }
}
