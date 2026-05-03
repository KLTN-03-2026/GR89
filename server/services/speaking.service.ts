import mongoose from "mongoose";
import { Speaking, ISpeaking, ISpeakingPaginateResult } from '../models/speaking.model';
import { IStudyHistory, StudyHistory } from '../models/studyHistory.model';
import { StudyService } from './study.service';
import ErrorHandler from '../utils/ErrorHandler';
import XLSX from 'xlsx'
import { MediaService } from './media.service';
import { Media, MediaSubtitlePreview } from '../models/media.model';
import { SpeechAceProvider } from '../providers/speechace.provider';
import { User } from "../models/user.model";
import { AIProvider } from "../providers/ai.provider";
import { AssessmentWordResult, ISpeakingProgress, SpeakingProgress } from "../models/speakingProgress.model";

interface ISpeakingData extends ISpeaking {
  progress: number
  isCompleted: boolean
}

interface OverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  avgSpeakingScore: number
  usersWithSpeakingScores: number
}

export class SpeakingService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về Speaking
  static async getOverviewStats(): Promise<OverviewStats> {
    const [totalLessons, activeLessons, totalUsers] = await Promise.all([
      Speaking.countDocuments(),
      Speaking.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' })
    ])

    const speakingUserAggregation = await StudyHistory.aggregate([
      { $match: { category: 'speaking', progress: { $gt: 0 } } },
      { $group: { _id: '$userId', totalPoint: { $max: '$progress' } } }
    ])

    const usersWithSpeakingScores = speakingUserAggregation.length
    const avgSpeakingScore = usersWithSpeakingScores
      ? Math.round(
        speakingUserAggregation.reduce((sum, item) => sum + (item.totalPoint || 0), 0) /
        usersWithSpeakingScores
      )
      : 0

    const completionRate = totalUsers > 0
      ? Math.round((usersWithSpeakingScores / totalUsers) * 100)
      : 0

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [monthlyLearnerIds, lastMonthLearnerIds] = await Promise.all([
      StudyHistory.distinct('userId', {
        category: 'speaking',
        createdAt: { $gte: currentMonth },
        progress: { $gt: 0 }
      }),
      StudyHistory.distinct('userId', {
        category: 'speaking',
        createdAt: { $gte: lastMonth, $lt: currentMonth },
        progress: { $gt: 0 }
      })
    ])

    const monthlyLearns = monthlyLearnerIds.length
    const lastMonthLearns = lastMonthLearnerIds.length

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
      avgSpeakingScore,
      usersWithSpeakingScores
    }
  }

  // (ADMIN) Lấy thống kê chi tiết Speaking
  static async getSpeakingStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCreatedBy: Record<string, number>;
  }> {
    const [total, active, inactive, byCreatedBy] = await Promise.all([
      Speaking.countDocuments(),
      Speaking.countDocuments({ isActive: true }),
      Speaking.countDocuments({ isActive: false }),
      Speaking.aggregate([
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 0, createdBy: '$user.fullName', count: 1 } }
      ])
    ])

    return {
      total,
      active,
      inactive,
      byCreatedBy: byCreatedBy.reduce((acc, item) => ({ ...acc, [item.createdBy]: item.count }), {})
    }
  }

  // (ADMIN) Xuất dữ liệu Speaking ra file Excel
  static async exportSpeakingData(): Promise<Buffer> {
    const speakings = await Speaking.find().populate('videoUrl', 'url subtitles')

    const speakingsRows: any[][] = [['ID', 'title', 'description', 'level', 'videoID', 'isActive', 'isVipRequired', 'orderIndex']]
    const subtitlesRows: any[][] = [['SpeakingID', 'start', 'end', 'english', 'phonetic', 'vietnamese', 'raw']]

    for (const s of (speakings as any[])) {
      speakingsRows.push([
        String(s._id),
        s.title ?? '',
        s.description ?? '',
        s.level || 'A1',
        s.videoUrl?._id?.toString() ?? '',
        s.isActive ? 'true' : 'false',
        s.isVipRequired ? 'true' : 'false',
        s.orderIndex ?? ''
      ])

      const subtitles = s.videoUrl?.subtitles?.[0]?.preview || []
      if (Array.isArray(subtitles)) {
        subtitles.forEach((sub: any) => {
          subtitlesRows.push([
            String(s._id),
            sub.start ?? '',
            sub.end ?? '',
            sub.english ?? '',
            sub.phonetic ?? '',
            sub.vietnamese ?? '',
            sub.raw ?? ''
          ])
        })
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(speakingsRows), 'Speakings')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subtitlesRows), 'Subtitles')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }

  // (ADMIN) Import dữ liệu Speaking từ JSON
  static async importSpeakingFromJson(options: {
    speakings: any[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { speakings, userId, skipErrors } = options
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

    for (let i = 0; i < speakings.length; i++) {
      const data = speakings[i]
      if (!data || typeof data !== 'object') {
        failOrCollect(i, 'Dữ liệu phải là object')
        continue
      }

      try {
        const title = normalizeString(data.title)
        if (!title) throw new Error('Thiếu hoặc rỗng "title"')

        const videoUrlInput = data.videoUrl ? normalizeString(data.videoUrl) : undefined
        if (!videoUrlInput) throw new Error('Video URL (Media ID hoặc Link) thiếu')

        const videoUrlId = await this.resolveMediaId(videoUrlInput, userId)

        const description = normalizeString(data.description)
        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false
        const levelRaw = data.level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        let existing = await Speaking.findOne({ title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.description = description
          existing.videoUrl = videoUrlId as any
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.level = level
          existing.updatedBy = new mongoose.Types.ObjectId(userId) as any
          await existing.save()
          updated++
        } else {
          await Speaking.create({
            title,
            description,
            videoUrl: videoUrlId,
            isVipRequired,
            isActive,
            level,
            createdBy: new mongoose.Types.ObjectId(userId)
          })
          created++
        }

        if (data.subtitles && Array.isArray(data.subtitles)) {
          const media = await Media.findById(videoUrlId)
          if (media) {
            const normalizedSubtitles = data.subtitles.map((sub: any) => ({
              start: normalizeString(sub.start),
              end: normalizeString(sub.end),
              english: normalizeString(sub.english || sub.sentence),
              phonetic: normalizeString(sub.phonetic),
              vietnamese: normalizeString(sub.vietnamese),
              raw: normalizeString(sub.raw)
            }))

            if (media.subtitles && media.subtitles.length > 0) {
              media.subtitles[0].preview = normalizedSubtitles
            } else {
              media.subtitles = media.subtitles || []
              media.subtitles.push({
                label: 'Main Subtitles',
                fileUrl: '',
                preview: normalizedSubtitles
              })
            }
            await media.save()
          }
        }

      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: speakings.length, skipped, errors }
  }

  // Helper xử lý Media ID hoặc URL (Chỉ chấp nhận Video)
  private static async resolveMediaId(videoInput: string, userId: string): Promise<mongoose.Types.ObjectId> {
    const input = String(videoInput || '').trim();
    if (!input) throw new ErrorHandler('Thiếu thông tin media', 400);

    if (mongoose.Types.ObjectId.isValid(input)) {
      const media = await MediaService.getMediaById(input);
      if (media) return new mongoose.Types.ObjectId(input);
    }

    const urlPattern = /^(https?:\/\/)/i;
    if (urlPattern.test(input)) {
      try {
        const media = await MediaService.createVideoFromUrl(input, userId);
        return media._id as mongoose.Types.ObjectId;
      } catch (error: any) {
        throw new ErrorHandler(`Không thể xử lý URL video: ${error.message}`, 400);
      }
    }

    throw new ErrorHandler(`Thông tin video không hợp lệ: ${input}`, 400);
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài nói (có phân trang & tìm kiếm)
  static async getAllSpeaking(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    createdBy?: string
  }): Promise<ISpeakingPaginateResult> {
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
        { description: { $regex: search, $options: 'i' } }
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
        { path: 'videoUrl', select: 'url type filename' },
        { path: 'createdBy', select: 'fullName email' },
        { path: 'updatedBy', select: 'fullName email' }
      ],
      lean: false,
      customLabels: {
        docs: 'speakings',
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

    return await Speaking.paginate(query, paginateOptions)
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài nói
  static async updateMultipleSpeakingStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedSpeakings: ISpeaking[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID speaking trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const speakings = await Speaking.find({ _id: { $in: validIds } })

    if (speakings.length !== validIds.length) {
      throw new ErrorHandler(`Không tìm thấy một số bài nói`, 404)
    }

    const result = await Speaking.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedSpeakings = await Speaking.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedSpeakings: updatedSpeakings as unknown as ISpeaking[]
    }
  }

  // (ADMIN) Xóa nhiều bài nói
  static async deleteMultipleSpeaking(ids: string[]) {
    const speakingToDelete = await Speaking.find({ _id: { $in: ids } }).select('orderIndex');
    const deletedOrderIndexes = speakingToDelete.map(s => s.orderIndex).sort((a, b) => a - b);

    const deletedSpeakings = await Speaking.deleteMany({ _id: { $in: ids } });
    if (!deletedSpeakings) throw new ErrorHandler('Bài nói không tồn tại', 404);

    for (const deletedOrderIndex of deletedOrderIndexes) {
      await Speaking.updateMany(
        { orderIndex: { $gt: deletedOrderIndex } },
        { $inc: { orderIndex: -1 } }
      );
    }

    return deletedSpeakings;
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách bài nói cho người dùng
  static async getSpeakingByUser(userId: string): Promise<ISpeakingData[]> {
    const speakings = await Speaking.find().sort({ orderIndex: 1 })
    if (!speakings) throw new ErrorHandler("Không tìm thấy bài nói", 404);

    // Lấy bản ghi tốt nhất từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category: 'speaking' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])

    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    const getAllSpeakings = speakings.map((speaking) => {
      const progressCurrent = progressMap.get(String(speaking._id))
      return {
        ...speaking.toObject(),
        isCompleted: progressCurrent?.status === 'passed',
        isActive: true,
        progress: progressCurrent?.progress || 0,
        point: progressCurrent?.progress || 0,
        isResult: !!(progressCurrent && ((progressCurrent.resultId && progressCurrent.resultId.length > 0) || (progressCurrent.progress || 0) > 0)),
        isVipRequired: speaking.isVipRequired !== undefined ? speaking.isVipRequired : true
      } as unknown as ISpeakingData
    })

    return getAllSpeakings
  }

  // (USER) Lấy thông tin chi tiết bài nói theo ID cho người dùng
  static async getSpeakingByIdForUser(speakingId: string, userId: string): Promise<ISpeaking> {
    const speaking = await Speaking.findOne({ _id: speakingId, isActive: true }).populate(
      "videoUrl",
      "url subtitles"
    );
    if (!speaking) throw new ErrorHandler("Bài nói không tồn tại", 404)

    // Lấy subtitles
    const subtitles = ((speaking as any).videoUrl as any)?.subtitles?.[0]?.preview as
      | Array<MediaSubtitlePreview>
      | undefined;
    if (!subtitles) throw new ErrorHandler("Câu phụ đề không tồn tại", 404);

    return {
      ...speaking.toObject(),
      videoUrl: (speaking.videoUrl as any).url,
      subtitleIds: subtitles
    } as unknown as ISpeaking
  }

  // (USER) Thành tích / kết quả đã lưu cho một bài nói
  static async getSpeakingResult(userId: string, speakingId: string): Promise<AssessmentWordResult[]> {
    const speaking = await Speaking.findById(speakingId)
    if (!speaking) throw new ErrorHandler("Bài nói không tồn tại", 404)

    const studyHistoryUser = await StudyHistory.findOne({ userId, lessonId: speakingId }).sort({ progress: -1, createdAt: -1 })
    if (!studyHistoryUser || !studyHistoryUser.resultId || studyHistoryUser.resultId.length === 0) throw new ErrorHandler("Bài nói chưa được học", 404)

    const speakingProgresses = await Promise.all(studyHistoryUser.resultId.map(async (resultId) => {
      const speakingProgress = await SpeakingProgress.findById(resultId)
      if (!speakingProgress) throw new ErrorHandler("Bài nói chưa được học", 404)
      return speakingProgress
    }))

    return speakingProgresses
  }

  static async saveHighestScore(userId: string, speakingId: string, studyTimeSeconds: number = 0, speakingProgresses: ISpeakingProgress[]): Promise<IStudyHistory> {
    const speaking = await Speaking.findById(speakingId);
    if (!speaking) throw new ErrorHandler("Bài nói không tồn tại", 404);

    if (speakingProgresses.length === 0) throw new ErrorHandler("Không có kết quả luyện nói", 400);
    const newSpeakingProgresses = await SpeakingProgress.create(speakingProgresses.map(sp => ({
      userId,
      lessonId: speakingId,
      index: sp.index,
      score: sp.score,
      words: sp.words,
      sentence: sp.sentence,
      aiFeedback: sp.aiFeedback,
    })))
    if (newSpeakingProgresses.length === 0) throw new ErrorHandler("Không thể lưu kết quả luyện nói", 400);

    const resultIds = newSpeakingProgresses.map(r => r._id as mongoose.Types.ObjectId);
    const progress = Math.round(speakingProgresses.reduce((acc, curr) => acc + curr.score, 0) / speakingProgresses.length);
    const isCompleted = progress >= 80;

    const newStudyHistory = await StudyService.saveStudyResult({
      userId,
      lessonId: speakingId,
      category: "speaking",
      level: speaking.level,
      progress,
      isCompleted: isCompleted,
      studyTime: studyTimeSeconds,
      resultId: resultIds,
    })

    return newStudyHistory
  }

  // (USER) Chấm điểm phát âm bằng AI
  static async assessPronunciationSpeaking(
    text: string,
    audioBuffer: Buffer,
  ): Promise<any> {
    if (!text || !text.trim()) {
      throw new ErrorHandler('Cần có văn bản mẫu', 400)
    }
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new ErrorHandler('Dữ liệu âm thanh trống', 400)
    }

    const provider = new SpeechAceProvider()
    const result = await provider.assessGuidedPronunciation({
      referenceText: text.trim(),
      audioBuffer,
      language: 'en-us'
    })

    // Generate simple Vietnamese feedback via AI (non-blocking)
    let aiFeedback = ""
    try {
      const textScore = result?.text_score
      const wordScoreList = textScore?.word_score_list || []
      const weakWords = (wordScoreList as any[])
        .filter((w: any) => (w?.quality_score ?? 0) < 80)
        .map((w: any) => String(w?.word || "").trim())
        .filter(Boolean)
        .slice(0, 6)

      const weakPhones = (wordScoreList as any[])
        .flatMap((w: any) => (Array.isArray(w?.phone_score_list) ? w.phone_score_list : []))
        .map((p: any) => ({ phone: String(p?.phone || p?.phoneme || ""), quality_score: Number(p?.quality_score ?? p?.score ?? 0) || 0 }))
        .filter((p: any) => !!p.phone)
        .sort((a: any, b: any) => a.quality_score - b.quality_score)
        .slice(0, 2)

      const overallScore = Math.round(
        textScore?.speechace_score?.pronunciation ??
        textScore?.overall_score ??
        result?.overall_score ??
        0
      )

      const systemPrompt = [
        "Bạn là huấn luyện viên Speaking tiếng Anh.",
        "Trả lời tiếng Việt, chỉ 1 dòng, tổng <= 160 ký tự.",
        "Luật theo overallScore:",
        "- overallScore >= 80: chỉ khen ngắn (2-6 từ). KHÔNG góp ý.",
        "- 60 <= overallScore < 80: khen ngắn + 1 gợi ý chỉnh sửa (ưu tiên âm yếu nhất/nhịp điệu), dễ làm theo.",
        "- overallScore < 60: 1 gợi ý chỉnh sửa ngắn (không cần khen).",
        "Không chấm điểm. Không emoji. Không ngoặc kép."
      ].join("\n")

      const userPrompt = JSON.stringify({
        type: "speaking_pronunciation_feedback",
        referenceText: text.trim(),
        overallScore,
        weakWords,
        weakPhones,
      })

      aiFeedback = await AIProvider.chatbotAi([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ])
    } catch {
      aiFeedback = ""
    }

    return {
      ...result,
      aiFeedback,
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy thông tin chi tiết bài nói theo ID
  static async getSpeakingById(id: string) {
    const speaking = await Speaking.findById(id)
      .populate('videoUrl', 'url type filename subtitles')
      .populate('createdBy', 'fullName email');
    if (!speaking) throw new ErrorHandler('Bài nói không tồn tại', 404);
    const preview = ((speaking as any).videoUrl as any)?.subtitles?.[0]?.preview;
    const subtitles = await this.getSubtitlesForSpeaking(speaking._id as mongoose.Types.ObjectId, preview);
    const speakingObj = speaking.toObject();
    (speakingObj as any).subtitleIds = subtitles;

    return speakingObj;
  }

  // (ADMIN) Tạo bài nói mới
  static async createSpeaking(speakingData: any, skipSubtitleCheck: boolean = false) {
    if (speakingData.title) {
      const titleExist = await Speaking.findOne({ title: speakingData.title.trim() });
      if (titleExist) throw new ErrorHandler('Tiêu đề bài nói đã tồn tại', 400);
    }

    if (speakingData.videoUrl && !skipSubtitleCheck) {
      const videoMedia = await Media.findById(speakingData.videoUrl);
      if (!videoMedia) throw new ErrorHandler('Video không tồn tại', 404);
      if (!videoMedia.subtitles || videoMedia.subtitles.length === 0) {
        throw new ErrorHandler('Video chưa có phụ đề. Vui lòng thêm phụ đề trước.', 400);
      }
    }

    if (speakingData.orderIndex === undefined || speakingData.orderIndex === null) {
      const maxOrderIndex = await Speaking.findOne().sort({ orderIndex: -1 }).select('orderIndex');
      speakingData.orderIndex = maxOrderIndex ? (maxOrderIndex.orderIndex || 0) + 1 : 1;
    }

    const speaking = await Speaking.create(speakingData);

    return await Speaking.findById(speaking._id)
      .populate('videoUrl', 'url type filename subtitles')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');
  }

  // (ADMIN) Cập nhật bài nói
  static async updateSpeaking(id: string, speaking: Partial<ISpeaking>) {
    const updatedSpeaking = await Speaking.findByIdAndUpdate(id, speaking, { new: true })
      .populate('videoUrl', 'url type filename subtitles')
      .populate('createdBy', 'fullName email');
    if (!updatedSpeaking) throw new ErrorHandler('Bài nói không tồn tại', 404);
    return updatedSpeaking;
  }

  // (ADMIN) Xóa một bài nói
  static async deleteSpeaking(id: string) {
    const speakingToDelete = await Speaking.findById(id);
    if (!speakingToDelete) throw new ErrorHandler('Bài nói không tồn tại', 404);

    const deletedOrderIndex = speakingToDelete.orderIndex;
    const deletedSpeaking = await Speaking.findByIdAndDelete(id);
    if (!deletedSpeaking) throw new ErrorHandler('Bài nói không tồn tại', 404);

    await Speaking.updateMany(
      { orderIndex: { $gt: deletedOrderIndex } },
      { $inc: { orderIndex: -1 } }
    );

    return deletedSpeaking;
  }

  // (ADMIN) Thay đổi thứ tự bài nói (Lên/Xuống)
  static async swapOrderIndex(speakingId: string, direction: 'up' | 'down'): Promise<{ currentSpeaking: ISpeaking; swappedSpeaking: ISpeaking }> {
    const currentSpeaking = await Speaking.findById(speakingId);
    if (!currentSpeaking) throw new ErrorHandler('Bài nói không tồn tại', 404);

    let adjacentSpeaking: ISpeaking | null = null;
    if (direction === 'up') {
      adjacentSpeaking = await Speaking.findOne({ orderIndex: { $lt: currentSpeaking.orderIndex } })
        .sort({ orderIndex: -1 });
    } else {
      adjacentSpeaking = await Speaking.findOne({ orderIndex: { $gt: currentSpeaking.orderIndex } })
        .sort({ orderIndex: 1 });
    }

    if (!adjacentSpeaking) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = currentSpeaking.orderIndex;
    const adjacentIndex = adjacentSpeaking.orderIndex;

    const temp = Date.now();
    await Speaking.updateOne({ _id: currentSpeaking._id }, { orderIndex: temp });
    await Speaking.updateOne({ _id: adjacentSpeaking._id }, { orderIndex: currentIndex });
    await Speaking.updateOne({ _id: currentSpeaking._id }, { orderIndex: adjacentIndex });

    return {
      currentSpeaking,
      swappedSpeaking: adjacentSpeaking
    };
  }

  // (ADMIN) Bật/tắt trạng thái xuất bản bài nói
  static async updateSpeakingStatus(id: string) {
    const speaking = await Speaking.findById(id);
    if (!speaking) throw new ErrorHandler('Bài nói không tồn tại', 404);
    speaking.isActive = !speaking.isActive;
    await speaking.save();
    return speaking;
  }

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài nói
  static async toggleVipStatus(id: string) {
    const speaking = await Speaking.findById(id)
    if (!speaking) throw new ErrorHandler('Bài nói không tồn tại', 404)
    speaking.isVipRequired = !speaking.isVipRequired
    await speaking.save()
    return speaking
  }

  // Helper: Lấy phụ đề cho bài nói
  private static async getSubtitlesForSpeaking(
    speakingId: mongoose.Types.ObjectId | string,
    fallbackPreview?: MediaSubtitlePreview[]
  ): Promise<MediaSubtitlePreview[]> {
    const normalizedId = speakingId instanceof mongoose.Types.ObjectId ? speakingId : new mongoose.Types.ObjectId(speakingId);
    const media = await Media.findById(normalizedId).select('subtitles');
    if (!media) throw new ErrorHandler('Media không tồn tại', 404);

    if (fallbackPreview && fallbackPreview.length > 0) {
      return media?.subtitles as unknown as MediaSubtitlePreview[];
    }

    return [];
  }
}
