import mongoose, { ObjectId } from "mongoose"
import XLSX from 'xlsx'
import { IListening, Listening, IListeningPaginateResult } from "../models/listening.model"
import ErrorHandler from "../utils/ErrorHandler"
import { StudyHistory } from '../models/studyHistory.model'
import { StudyService } from './study.service'
import { StreakService } from "./streak.service"
import { User } from "../models/user.model"
import { MediaService } from "./media.service"

export class ListeningService {
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
    const rows: any[][] = [['ID', 'title', 'description', 'level', 'audioID', 'subtitle', 'isActive', 'orderIndex']]
    for (const l of listenings as any[]) {
      rows.push([
        String(l._id), l.title || '', l.description || '', l.level || 'A1', l.audio ? String(l.audio) : '', l.subtitle || '', !!l.isActive, l.orderIndex ?? ''
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

        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false
        const levelRaw = data.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        let existing = await Listening.findOne({ title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.description = description
          existing.audio = audioId
          existing.subtitle = subtitle
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.level = level
          existing.updatedBy = new mongoose.Types.ObjectId(userId)
          await existing.save()
          updated++
        } else {
          await Listening.create({
            title,
            description,
            audio: audioId,
            subtitle,
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
        { subtitle: { $regex: search, $options: 'i' } }
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

  // (USER) Lấy thông tin chi tiết bài nghe theo ID
  static async getListeningById(id: string): Promise<IListening> {
    const listening = await Listening.findById(id).populate({
      path: 'audio',
      select: 'url'
    })
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    return {
      ...listening.toObject(),
      audio: (listening.audio as any)?.url || null
    } as unknown as IListening
  }

  // (USER) Nộp bài làm quiz bài nghe
  static async doListeningQuiz(
    userId: string,
    listeningId: string,
    time: number,
    result: { index: number, text: string, isCorrect: boolean }[],
    studyTimeSeconds: number = 0
  ) {
    const listening = await Listening.findById(listeningId)
    if (!listening) throw new ErrorHandler('Bài nghe không tồn tại', 404)

    const point = result.filter(r => r.isCorrect).length
    const progress = Math.round(((point / result.length) * 100) * 100) / 100
    const sessionDuration = Math.max(0, studyTimeSeconds > 0 ? studyTimeSeconds : Number(time) || 0)

    // Lưu kết quả qua StudyService (Unified)
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: listeningId,
      category: 'listening',
      level: (listening as any).level || 'A1',
      progress,
      point,
      isCompleted: true, // Chỉ cần có làm là tính hoàn thành
      studyTime: sessionDuration,
      resultData: result,
      correctAnswers: point,
      totalQuestions: result.length
    })

    // Luôn cập nhật streak khi có tham gia làm bài
    await StreakService.update(userId);

    return history
  }

  // (USER) Lấy kết quả bài nghe
  static async getListeningResult(userId: string, listeningId: string): Promise<any> {
    const history = await StudyHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(listeningId),
      category: 'listening'
    }).sort({ progress: -1, createdAt: -1 })

    if (!history) throw new ErrorHandler('Kết quả bài nghe không tồn tại', 404)

    return {
      ...history.toObject(),
      result: history?.resultId || []
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo bài nghe mới
  static async createListening(listening: IListening): Promise<IListening> {
    if (listening.title) {
      const titleExist = await Listening.findOne({ title: listening.title.trim() });
      if (titleExist) throw new ErrorHandler('Tiêu đề bài nghe đã tồn tại', 400);
    }

    const last = await Listening.findOne().sort({ orderIndex: -1 })
    const nextOrderIndex = (last?.orderIndex || 0) + 1

    return await Listening.create({
      ...listening,
      title: listening.title?.trim(),
      audio: new mongoose.Types.ObjectId(listening.audio),
      orderIndex: nextOrderIndex
    })
  }

  // (ADMIN) Cập nhật bài nghe
  static async updateListening(id: string, listening: IListening): Promise<IListening> {
    const updatePayload: any = { ...listening }
    if (listening && (listening as any).audio) {
      try {
        updatePayload.audio = new mongoose.Types.ObjectId((listening as any).audio)
      } catch {
        throw new ErrorHandler('ID Media không hợp lệ', 400)
      }
    }
    const updatedListening = await Listening.findByIdAndUpdate(id, updatePayload, { new: true })
    if (!updatedListening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
    return updatedListening
  }

  // (ADMIN) Xóa một bài nghe
  static async deleteListening(id: string): Promise<IListening> {
    const deletedListening = await Listening.findByIdAndDelete(id)
    if (!deletedListening) throw new ErrorHandler('Bài nghe không tồn tại', 404)
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
