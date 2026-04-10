import { IIpa, Ipa, IIpaPaginateResult, IExample } from "../models/ipa.model"
import { StudyHistory } from "../models/studyHistory.model"
import { StudyService } from "./study.service"
import { SpeechAceProvider } from "../providers/speechace.provider"
import ErrorHandler from "../utils/ErrorHandler"
import XLSX from 'xlsx'
import mongoose from "mongoose"
import { AIProvider } from "../providers/ai.provider"
import { User } from "../models/user.model"
import { MediaService } from "./media.service"

export class IpaService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về IPA
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await Ipa.countDocuments();
    const activeLessons = await Ipa.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await StudyHistory.countDocuments({ category: 'ipa' });
    const completedProgressRecords = await StudyHistory.countDocuments({ category: 'ipa', status: 'passed' });

    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await StudyHistory.countDocuments({
      category: 'ipa',
      createdAt: { $gte: currentMonth }
    })

    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await StudyHistory.countDocuments({
      category: 'ipa',
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

  // (ADMIN) Xuất dữ liệu IPA ra file Excel
  static async exportIpaData(): Promise<Buffer> {
    const ipas = await Ipa.find()
      .populate('image', '_id')
      .populate('video', '_id')
      .sort({ sound: 1 })
      .lean()

    const ipaRows: any[][] = [[
      'ID', 'sound', 'soundType', 'imageID', 'videoID', 'description'
    ]]
    const exampleRows: any[][] = [[
      'IPA_ID', 'word', 'phonetic', 'vietnamese'
    ]]

    for (const i of ipas as any[]) {
      ipaRows.push([
        String(i._id), i.sound || '', i.soundType || '', i.image ? String(i.image._id ?? i.image) : '', i.video ? String(i.video._id ?? i.video) : '', i.description || ''
      ])
      const examples = Array.isArray(i.examples) ? i.examples : []
      for (const ex of examples) {
        exampleRows.push([
          String(i._id), String(ex.word || ''), String(ex.phonetic || ''), String(ex.vietnamese || '')
        ])
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ipaRows), 'IPAs')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exampleRows), 'Examples')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }

  // (ADMIN) Import dữ liệu IPA từ JSON
  static async importIpaFromJson(options: {
    ipas: any[]
    userId: string
    skipErrors: boolean
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { ipas, userId, skipErrors } = options
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

    for (let i = 0; i < ipas.length; i++) {
      const data = ipas[i]
      if (!data || typeof data !== 'object') {
        failOrCollect(i, 'Dữ liệu phải là object')
        continue
      }

      try {
        const sound = normalizeString(data.sound)
        if (!sound) throw new Error('Thiếu hoặc rỗng "sound"')

        const soundType = normalizeString(data.soundType)
        if (!['vowel', 'consonant', 'diphthong'].includes(soundType)) {
          throw new Error('soundType không hợp lệ (vowel/consonant/diphthong)')
        }

        const imageInput = data.image ? normalizeString(data.image) : undefined
        const imageId = imageInput ? await this.resolveVideoId(imageInput, userId) : undefined

        const videoInput = data.video ? normalizeString(data.video) : undefined
        const videoId = videoInput ? await this.resolveVideoId(videoInput, userId) : undefined

        const description = normalizeString(data.description)
        const isVipRequired = typeof data.isVipRequired === 'boolean' ? data.isVipRequired : true
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : false

        const examplesInput = Array.isArray(data.examples) ? data.examples : []

        const normalizedExamples = examplesInput.map((ex: any, j: number) => {
          if (!ex.word) throw new Error(`Example [${j}] thiếu "word"`)
          return {
            word: normalizeString(ex.word),
            phonetic: normalizeString(ex.phonetic),
            vietnamese: normalizeString(ex.vietnamese)
          }
        })

        let existing = await Ipa.findOne({ sound: { $regex: `^${sound.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })

        if (existing) {
          existing.soundType = soundType as any
          existing.description = description
          if (imageId) existing.image = imageId as any
          if (videoId) existing.video = videoId as any
          existing.isVipRequired = isVipRequired
          existing.isActive = isActive
          existing.updatedBy = new mongoose.Types.ObjectId(userId)
          existing.examples = normalizedExamples

          await existing.save()
          updated++
        } else {
          const newIpa = new Ipa({
            sound,
            soundType,
            description,
            image: imageId,
            video: videoId,
            isVipRequired,
            isActive,
            examples: normalizedExamples,
            createdBy: new mongoose.Types.ObjectId(userId)
          })

          await newIpa.save()
          created++
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return { created, updated, total: ipas.length, skipped, errors }
  }

  // Helper xử lý Media ID hoặc URL (Chỉ chấp nhận Video)
  private static async resolveVideoId(videoInput: string, userId: string): Promise<mongoose.Types.ObjectId> {
    const input = String(videoInput || '').trim();
    if (!input) throw new ErrorHandler('Thiếu thông tin media (video)', 400);

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

  // (ADMIN) Lấy danh sách IPA (có phân trang & tìm kiếm)
  static async getAllIPAPaginated(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    soundType?: 'vowel' | 'consonant' | 'diphthong'
    createdBy?: string
    isActive?: boolean
  }): Promise<IIpaPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'sound',
      sortOrder = 'asc',
      soundType,
      createdBy
    } = options

    const query: any = {}
    if (search) {
      query.$or = [
        { sound: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    if (soundType) {
      query.soundType = soundType
    }
    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy)
    }
    if (options.isActive !== undefined) {
      query.isActive = options.isActive
    }

    const paginateOptions = {
      page,
      limit,
      sort: { orderIndex: 1 },
      populate: [
        { path: 'image', select: 'url' },
        { path: 'video', select: 'url' },
        { path: 'createdBy', select: 'fullName email' },
        { path: 'updatedBy', select: 'fullName email' }
      ],
      lean: false,
      customLabels: {
        docs: 'ipas',
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

    return await Ipa.paginate(query, paginateOptions)
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều IPA
  static async updateManyIpaStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number; updatedIpas: IIpa[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID IPA trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const ipas = await Ipa.find({ _id: { $in: validIds } })

    if (ipas.length !== validIds.length) {
      throw new ErrorHandler(`Không tìm thấy một số IPA`, 404)
    }

    const result = await Ipa.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive } }
    )

    const updatedIpas = await Ipa.find({ _id: { $in: validIds } })

    return {
      updatedCount: result.modifiedCount || 0,
      updatedIpas
    }
  }

  // (ADMIN) Xóa nhiều IPA
  static async deleteManyIpa(ids: string[]): Promise<{ deletedCount: number; deletedIpas: IIpa[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID IPA trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const ipasToDelete = await Ipa.find({ _id: { $in: validIds } }).session(session)

      if (ipasToDelete.length === 0) {
        throw new ErrorHandler('Không tìm thấy IPA để xóa', 404)
      }

      const deleteResult = await Ipa.deleteMany({ _id: { $in: validIds } }).session(session)

      await session.commitTransaction()

      return {
        deletedCount: Number(deleteResult?.deletedCount || 0),
        deletedIpas: ipasToDelete as unknown as IIpa[]
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/
  // (USER) Lấy danh sách IPA kèm tiến độ cho người dùng
  static async getIpaByUser(userId: string): Promise<IIpa[]> {
    const ipas = await Ipa.find({ isActive: true })
      .sort({ orderIndex: 1 })

    // Lấy bản ghi tốt nhất từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), category: 'ipa' } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])

    const progressMap = new Map(progresses.map(p => [String(p._id), p.best]))

    return ipas.map((ipa) => {
      const p = progressMap.get(String(ipa._id));
      return {
        ...ipa.toObject(),
        progress: p?.progress || 0,
        point: p?.progress || 0,
        isCompleted: p?.status === 'passed',
        isActive: true,
        isResult: !!(p && ((p.resultId && p.resultId.length > 0) || (p.progress || 0) > 0)),
        isVipRequired: ipa.isVipRequired !== undefined ? ipa.isVipRequired : true,
      } as unknown as IIpa;
    });
  }

  // (USER) Chấm điểm phát âm IPA bằng AI và lưu kết quả
  static async assessPronunciationIpa(
    referenceText: string,
    audioBuffer: Buffer,
    userId: string,
    ipaId: string,
    studyTimeSeconds: number = 0
  ): Promise<any> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)

    const speechAceProvider = new SpeechAceProvider()
    const result = await speechAceProvider.assessGuidedPronunciation({
      referenceText: referenceText.trim(),
      audioBuffer
    })

    if (result.status == 'error' || !result.text_score || !result.text_score.word_score_list || result.text_score.word_score_list.length === 0) {
      throw new ErrorHandler('Không phát hiện thấy giọng nói nào, vui lòng thử lại', 500)
    }

    const textScore = result.text_score
    const wordScoreList = textScore.word_score_list || []

    const overallScoreRaw =
      textScore?.speechace_score?.pronunciation ??
      textScore?.toeic_score?.pronunciation ??
      textScore?.pte_score?.pronunciation ??
      textScore?.quality_score ??
      0
    const overallScore = Number(overallScoreRaw) || 0

    const phoneScoreList =
      (Array.isArray((textScore as any)?.phone_score_list) ? (textScore as any).phone_score_list : undefined) ??
      (Array.isArray((wordScoreList?.[0] as any)?.phone_score_list) ? (wordScoreList[0] as any).phone_score_list : undefined) ??
      (Array.isArray((wordScoreList?.[0] as any)?.phone_score_list_list) ? (wordScoreList[0] as any).phone_score_list_list : undefined) ??
      wordScoreList
        .flatMap((w: any) => (Array.isArray(w?.phone_score_list) ? w.phone_score_list : []))

    // Ở bước assess chỉ chấm điểm và trả kết quả ngay; chưa lưu history/progress.

    // Gọi AI để sinh nhận xét chi tiết (tiếng Việt) cho người học
    let aiFeedback = ""
    try {
      const weakPhones = (Array.isArray(phoneScoreList) ? phoneScoreList : [])
        .map((p: any) => ({ phone: String(p?.phone || ""), quality_score: Number(p?.quality_score) || 0 }))
        .filter(p => !!p.phone)
        .sort((a, b) => a.quality_score - b.quality_score)
        .slice(0, 2)

      const systemPrompt = [
        "Bạn là giáo viên phát âm tiếng Anh.",
        "Ngữ cảnh: Bài IPA chỉ có 1 TỪ, mục tiêu là sửa phát âm theo từng ÂM (phoneme).",
        "Trả lời tiếng Việt, cực ngắn, chỉ 2 dòng, tổng <= 160 ký tự.",
        "hướng dẫn sửa ÂM yếu nhất (nêu âm + mẹo đặt miệng/lưỡi/ngắt hơi).",
        "Không chấm điểm. Không ví dụ câu. Không emoji. Không dấu ngoặc kép."
      ].join("\n")

      const userPrompt = JSON.stringify({
        type: "ipa_pronunciation_feedback",
        referenceText: referenceText.trim(),
        overallScore,
        weakPhones,
      })

      aiFeedback = await AIProvider.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ])
    } catch {
      // Nếu AI lỗi thì bỏ qua, không chặn kết quả chính
      aiFeedback = ""
    }

    // Return the shape the client UI expects (IIpaScoringResult)
    return {
      word: referenceText.trim(),
      quality_score: overallScore,
      phone_score_list: Array.isArray(phoneScoreList) ? phoneScoreList : [],
      aiFeedback,
    }
  }

  // (USER) Lấy điểm cao nhất của bài IPA
  static async getHighestScore(
    userId: string,
    ipaId: string
  ): Promise<number> {
    const history = await StudyHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(ipaId),
      category: 'ipa'
    }).sort({ progress: -1, createdAt: -1 });

    return history?.progress || 0;
  }

  // (USER) Lấy thông tin chi tiết IPA theo ID cho người dùng
  static async getIpaByIdForUser(id: string, userId: string): Promise<IIpa> {
    const ipa = await Ipa.findOne({ _id: id, isActive: true })
      .populate('image')
      .populate('video');
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404);

    return ipa;
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy thông tin chi tiết IPA theo ID
  static async getIpaById(id: string): Promise<IIpa> {
    const ipa = await Ipa.findOne({ _id: id }).populate({
      path: 'image',
      select: 'url'
    }).populate({
      path: 'video',
      select: 'url'
    })
      .lean()
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)
    return {
      ...ipa,
      image: (ipa.image as any)?.url || null,
      video: (ipa.video as any)?.url || null
    } as unknown as IIpa
  }

  // (ADMIN) Tạo IPA mới
  static async createIpa(ipa: IIpa): Promise<IIpa> {
    const newIpa = await Ipa.create(ipa)
    return newIpa
  }

  // (ADMIN) Cập nhật IPA
  static async updateIpa(id: string, ipa: IIpa): Promise<IIpa> {
    const updatedIpa = await Ipa.findByIdAndUpdate(id, ipa, { new: true })
    if (!updatedIpa) throw new ErrorHandler('IPA không tồn tại', 404)
    return updatedIpa
  }

  // (ADMIN) Xóa một IPA
  static async deleteIpa(id: string): Promise<IIpa> {
    const deletedIpa = await Ipa.findByIdAndDelete(id)
    if (!deletedIpa) throw new ErrorHandler('IPA không tồn tại', 404)
    return deletedIpa
  }

  // (ADMIN) Bật/tắt trạng thái xuất bản IPA
  static async updateIpaStatus(ipaId: string): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)
    ipa.isActive = !ipa.isActive
    await ipa.save()
    return ipa
  }

  // (ADMIN) Bật/tắt yêu cầu VIP cho IPA
  static async toggleVipStatus(ipaId: string): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)
    ipa.isVipRequired = !ipa.isVipRequired
    await ipa.save()
    return ipa
  }

  // (ADMIN) Thêm ví dụ cho IPA
  static async addExampleIpa(ipaId: string, example: IExample): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)

    ipa.examples.push(example)
    await ipa.save()
    return ipa
  }

  // (ADMIN) Thay đổi thứ tự IPA (Lên/Xuống)
  static async swapOrderIndex(ipaId: string, direction: 'up' | 'down'): Promise<{ currentIpa: IIpa; swappedIpa: IIpa }> {
    const currentIpa = await Ipa.findById(ipaId);
    if (!currentIpa) throw new ErrorHandler('IPA không tồn tại', 404);

    let adjacentIpa: IIpa | null = null;
    if (direction === 'up') {
      adjacentIpa = await Ipa.findOne({ orderIndex: { $lt: currentIpa.orderIndex } })
        .sort({ orderIndex: -1 });
    } else {
      adjacentIpa = await Ipa.findOne({ orderIndex: { $gt: currentIpa.orderIndex } })
        .sort({ orderIndex: 1 });
    }

    if (!adjacentIpa) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400);
    }

    const currentIndex = currentIpa.orderIndex;
    const adjacentIndex = adjacentIpa.orderIndex;

    const temp = Date.now();

    // B1: đẩy current ra ngoài
    await Ipa.updateOne(
      { _id: currentIpa._id },
      { orderIndex: temp }
    );

    // B2: cập nhật adjacent
    await Ipa.updateOne(
      { _id: adjacentIpa._id },
      { orderIndex: currentIndex }
    );

    // B3: cập nhật current
    await Ipa.updateOne(
      { _id: currentIpa._id },
      { orderIndex: adjacentIndex }
    );

    return {
      currentIpa,
      swappedIpa: adjacentIpa
    };
  }

  // (ADMIN) Cập nhật ví dụ cho IPA
  static async updateExampleIpa(ipaId: string, exampleId: string, example: IExample): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)

    const exampleIndex = ipa.examples.findIndex(ex => (ex as any)._id.toString() === exampleId)
    if (exampleIndex === -1) throw new ErrorHandler('Ví dụ không tồn tại trong IPA này', 404)

    ipa.examples[exampleIndex] = { ...example, _id: new mongoose.Types.ObjectId(exampleId) } as any
    await ipa.save()
    return ipa
  }

  // (ADMIN) Xóa ví dụ khỏi IPA
  static async deleteExampleIpa(ipaId: string, exampleId: string): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)
    ipa.examples = ipa.examples.filter(example => (example as any)._id.toString() !== exampleId)
    await ipa.save()
    return ipa
  }

  // (ADMIN) Xóa nhiều ví dụ khỏi IPA
  static async deleteManyExamplesIpa(ipaId: string, exampleIds: string[]): Promise<IIpa> {
    const ipa = await Ipa.findById(ipaId)
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)

    const idSet = new Set(exampleIds.map(id => String(id)))
    ipa.examples = ipa.examples.filter(example => !idSet.has((example as any)._id.toString()))
    await ipa.save()
    return ipa
  }

  // Lưu điểm vào IpaProgress (chỉ lưu nếu điểm mới > điểm cũ)
  static async saveHighestScore(
    userId: string,
    ipaId: string,
    progress: number,
    studyTimeSeconds: number = 0
  ): Promise<{
    isNewRecord: boolean
    currentScore: number
    previousBest?: number
    progress: {
      _id: string
      userId: string
      ipaId: string
      progress: number
      createdAt?: Date
      updatedAt?: Date
    }
  }> {
    const ipa = await Ipa.findById(ipaId).select('level')
    if (!ipa) throw new ErrorHandler('IPA không tồn tại', 404)

    const existingBest = await StudyHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(ipaId),
      category: 'ipa'
    }).sort({ progress: -1, createdAt: -1 })

    const previousBest = existingBest?.progress || 0
    const isNewRecord = progress > previousBest

    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: ipaId,
      category: 'ipa',
      level: (ipa as any).level || 'A1',
      progress,
      point: progress,
      isCompleted: true, // Chỉ cần có làm là tính hoàn thành
      studyTime: Math.max(0, studyTimeSeconds),
      resultData: { score: progress }
    })

    return {
      isNewRecord,
      currentScore: progress,
      previousBest,
      progress: {
        _id: history?._id?.toString() || '',
        userId: userId,
        ipaId: ipaId,
        progress: progress,
        createdAt: history?.createdAt,
        updatedAt: history?.createdAt
      }
    }
  }
}