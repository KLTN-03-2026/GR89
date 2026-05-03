import mongoose from 'mongoose'
import { Entertainment, IEntertainment, IEntertainmentPaginateResult } from '../models/entertainment.model'
import ErrorHandler from '../utils/ErrorHandler'
import XLSX from 'xlsx'
import { Media, MediaSubtitlePreview } from '../models/media.model'
import { EntertainmentInteraction } from '../models/entertainmentInteraction.model'
import { EntertainmentStats } from '../models/entertainmentStats.model'
import { EntertainmentComment } from '../models/entertainmentComment.model'
import { MediaService } from './media.service'

export class EntertainmentService {
  private static parseSrtTimeToSeconds(value?: string): number | undefined {
    if (!value) return undefined
    const normalized = value.replace(',', '.')
    const parts = normalized.split(':')
    if (parts.length !== 3) return undefined
    const [hh, mm, ssRaw] = parts
    const seconds = parseFloat(ssRaw)
    if (Number.isNaN(seconds)) return undefined
    return Number(hh) * 3600 + Number(mm) * 60 + seconds
  }

  private static extractVideoSubtitles(preview?: MediaSubtitlePreview[]) {
    if (!preview || preview.length === 0) return []
    return preview.map(entry => ({
      start: this.parseSrtTimeToSeconds(entry.start) ?? 0,
      end: this.parseSrtTimeToSeconds(entry.end) ?? 0,
      en: entry.english || '',
      vi: entry.vietnamese || ''
    }))
  }

  private static mapEntertainmentDoc(entertainment: any) {
    if (!entertainment) return entertainment
    const plain = typeof entertainment.toObject === 'function' ? entertainment.toObject() : entertainment
    const preview = plain?.videoUrl?.subtitles?.[0]?.preview
    return {
      ...plain,
      videoSubtitleList: this.extractVideoSubtitles(preview)
    }
  }

  // Helper xử lý Media ID hoặc URL (Chỉ chấp nhận Image)
  private static async resolveImageId(imageInput: string, userId: string): Promise<mongoose.Types.ObjectId> {
    const input = String(imageInput || '').trim();
    if (!input) throw new ErrorHandler('Thiếu thông tin media (image)', 400);

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
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan giải trí
  static async getOverviewStats(type?: 'movie' | 'music' | 'podcast'): Promise<any> {
    const query: any = {}
    if (type) {
      if (type === 'movie') {
        query.type = { $in: ['movie', 'series'] }
      } else {
        query.type = type
      }
    }

    const [
      totalItems,
      activeItems,
      vipItems,
      movieCount,
      musicCount,
      podcastCount,
      totalInteractions,
      likedCount,
      watchedCount
    ] = await Promise.all([
      Entertainment.countDocuments(query),
      Entertainment.countDocuments({ ...query, status: true }),
      Entertainment.countDocuments({ ...query, isVipRequired: true }),
      Entertainment.countDocuments({ type: { $in: ['movie', 'series'] } }),
      Entertainment.countDocuments({ type: 'music' }),
      Entertainment.countDocuments({ type: 'podcast' }),
      EntertainmentInteraction.countDocuments(type ? { 'entertainmentId': { $in: await Entertainment.find(query).distinct('_id') } } : {}),
      EntertainmentInteraction.countDocuments(type ? { 'entertainmentId': { $in: await Entertainment.find(query).distinct('_id') }, liked: true } : { liked: true }),
      EntertainmentInteraction.countDocuments(type ? { 'entertainmentId': { $in: await Entertainment.find(query).distinct('_id') }, watched: true } : { watched: true })
    ])

    return {
      totalItems,
      activeItems,
      vipItems,
      typeBreakdown: {
        movie: movieCount,
        music: musicCount,
        podcast: podcastCount
      },
      interactions: {
        total: totalInteractions,
        liked: likedCount,
        watched: watchedCount
      }
    }
  }

  // (ADMIN) Lấy thống kê giải trí của người dùng
  static async getStatsForUser(userId: string) {
    await this.syncUserStats(userId)
    const stats = await EntertainmentStats.find({ userId }).lean()
    return stats.map(stat => ({
      type: stat.type,
      totalItems: stat.totalItems,
      viewedCount: stat.viewedCount,
      totalWatchTime: stat.totalWatchTime,
      lastUpdated: stat.lastUpdated
    }))
  }

  // (ADMIN) Xuất dữ liệu giải trí ra file Excel
  static async exportEntertainmentData(type?: 'movie' | 'music' | 'podcast'): Promise<Buffer> {
    const query: any = {}
    if (type) query.type = type
    const items = await Entertainment.find(query)
      .populate('videoUrl', '_id url')
      .populate('thumbnailUrl', '_id url')
      .sort({ createdAt: -1 })

    const sheet: any[][] = []
    sheet.push(['ID', 'title', 'description', 'author', 'type', 'isActive', 'isVipRequired', 'videoID', 'thumbnailID'])
    for (const it of items) {
      const videoId = (it as any).videoUrl?._id ? String((it as any).videoUrl._id) : (typeof (it as any).videoUrl === 'string' ? (it as any).videoUrl : '')
      const thumbId = (it as any).thumbnailUrl?._id ? String((it as any).thumbnailUrl._id) : (typeof (it as any).thumbnailUrl === 'string' ? (it as any).thumbnailUrl : '')
      sheet.push([
        String(it._id),
        String(it.title ?? ''),
        String(it.description ?? ''),
        String(it.author ?? ''),
        String(it.type ?? ''),
        it.status ? 'TRUE' : 'FALSE',
        it.isVipRequired ? 'TRUE' : 'FALSE',
        String(videoId ?? ''),
        String(thumbId ?? ''),
      ])
    }

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(sheet)
    XLSX.utils.book_append_sheet(wb, ws, 'Entertainments')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    return buf
  }

  // (ADMIN) Import dữ liệu giải trí từ file Excel
  static async importEntertainmentExcel(options: { file: any; userId: string; skipErrors: boolean; defaultType?: 'movie' | 'music' | 'podcast' }) {
    if (!options.file) throw new ErrorHandler("Vui lòng tải lên file Excel", 400);

    let buffer: Buffer;
    if (options.file.path) {
      buffer = require('fs').readFileSync(options.file.path);
    } else if (options.file.data) {
      buffer = options.file.data;
    } else {
      throw new ErrorHandler("Dữ liệu file không hợp lệ", 400);
    }

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets['Entertainments'];
    if (!sheet) throw new ErrorHandler('Thiếu sheet Entertainments', 400);

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[];
    const items = rows.map(r => ({
      ...r,
      title: String(r.title ?? r.TITLE ?? '').trim(),
      isActive: String(r.isActive || r.status || '').toUpperCase() === 'TRUE',
      isVipRequired: String(r.isVipRequired || '').toUpperCase() === 'TRUE',
      videoUrl: r.videoID || r.videoId || r.videoUrl,
      thumbnailUrl: r.thumbnailID || r.thumbnailId || r.thumbnailUrl
    }));

    return await this.importEntertainmentFromJson({
      items,
      userId: options.userId,
      skipErrors: options.skipErrors,
      defaultType: options.defaultType
    });
  }

  // (ADMIN) Import dữ liệu giải trí từ JSON
  static async importEntertainmentFromJson(options: {
    items: any[]
    userId: string
    skipErrors: boolean
    defaultType?: 'movie' | 'music' | 'podcast'
  }): Promise<{ created: number; updated: number; total: number; skipped: number; errors: any[] }> {
    const { items, userId, skipErrors, defaultType } = options
    const results = { created: 0, updated: 0, total: items.length, skipped: 0, errors: [] as any[] }

    for (let idx = 0; idx < items.length; idx++) {
      const r = items[idx]
      try {
        const title = String(r.title ?? '').trim()
        const description = String(r.description ?? '').trim()
        const author = String(r.author ?? '').trim()
        const typeInput = String(r.type || defaultType || '').trim().toLowerCase()
        const type = (['movie', 'music', 'podcast'].includes(typeInput) ? typeInput : defaultType) as any
        const isActive = r.isActive === true || String(r.isActive).toUpperCase() === 'TRUE'
        const isVipRequired = r.isVipRequired === true || String(r.isVipRequired).toUpperCase() === 'TRUE'
        const videoInput = String(r.videoUrl || r.videoID || '').trim()
        const thumbnailInput = String(r.thumbnailUrl || r.thumbnailID || '').trim()

        if (!title) throw new Error(`Dòng ${idx + 1}: thiếu title`)
        if (!type || !['movie', 'music', 'podcast'].includes(type)) throw new Error(`Dòng ${idx + 1}: type không hợp lệ (${typeInput}) - movie|music|podcast`)

        let videoRef = undefined
        if (videoInput) {
          videoRef = await this.resolveVideoId(videoInput, userId)
          // Kiểm tra video có subtitle hay chưa
          const v = await Media.findById(videoRef)
          if (!v) throw new Error(`Dòng ${idx + 1}: Không tìm thấy media cho videoID/URL: ${videoInput}`)
          if (!v.subtitles || v.subtitles.length === 0) {
            throw new Error(`Dòng ${idx + 1}: Video chưa có subtitle`)
          }
        }

        let thumbRef = undefined
        if (thumbnailInput) {
          thumbRef = await this.resolveImageId(thumbnailInput, userId)
        }

        // Upsert: tìm theo title + type
        const exist = await Entertainment.findOne({ title, type })
        if (exist) {
          exist.description = description
          exist.author = author
          exist.status = isActive
          exist.isVipRequired = isVipRequired
          if (videoRef) exist.videoUrl = videoRef
          if (thumbRef) exist.thumbnailUrl = thumbRef
          await exist.save()
          results.updated += 1
        } else {
          await Entertainment.create({
            title,
            description,
            author,
            type,
            status: isActive,
            isVipRequired,
            videoUrl: videoRef,
            thumbnailUrl: thumbRef,
            createdBy: new mongoose.Types.ObjectId(userId)
          } as Partial<IEntertainment>)
          results.created += 1
        }
      } catch (err: any) {
        if (skipErrors) {
          results.errors.push({ index: idx, reason: err?.message || `Lỗi không xác định` })
          results.skipped += 1
          continue
        }
        throw err
      }
    }
    return results
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách giải trí (có phân trang & tìm kiếm)
  static async getAllPaginated(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    status?: boolean
    createdBy?: string
    type?: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
    parentId?: string
  }): Promise<IEntertainmentPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      createdBy,
      type,
      parentId
    } = options

    const query: any = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ]
    }
    if (status !== undefined) query.status = status
    if (createdBy) query.createdBy = new mongoose.Types.ObjectId(createdBy)

    if (type) {
      if (type === 'movie') {
        query.type = { $in: ['movie', 'series'] }
      } else {
        query.type = type
      }
    }

    if (parentId) query.parentId = new mongoose.Types.ObjectId(parentId)

    const sort: any = {}
    if (sortBy === 'orderIndex') {
      sort.orderIndex = sortOrder === 'asc' ? 1 : -1
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        { path: 'createdBy', select: 'fullName email' },
        { path: 'videoUrl', select: 'url type format size duration subtitles' },
        { path: 'thumbnailUrl', select: 'url type format size width height' }
      ],
      lean: false,
      customLabels: {
        docs: 'entertainments',
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

    const result = await (Entertainment as any).paginate(query, paginateOptions)
    result.entertainments = result.entertainments.map((ent: any) => this.mapEntertainmentDoc(ent))
    return result
  }

  // (ADMIN) Cập nhật trạng thái cho nhiều mục giải trí
  static async updateMultipleEntertainmentStatus(ids: string[], status: boolean): Promise<{ updatedCount: number; updatedEntertainments: IEntertainment[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID giải trí trống', 400)
    }

    const validIds = ids
      .map(id => String(id).trim())
      .filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new ErrorHandler('Không có ID hợp lệ', 400)
    }

    const result = await Entertainment.updateMany(
      { _id: { $in: validIds } },
      { $set: { status } }
    )

    const updatedEntertainments = await Entertainment.find({ _id: { $in: validIds } })
      .populate('videoUrl', 'url type format size duration subtitles')
      .populate('thumbnailUrl', 'url type format size width height')

    return {
      updatedCount: result.modifiedCount || 0,
      updatedEntertainments: updatedEntertainments.map(ent => this.mapEntertainmentDoc(ent)) as unknown as IEntertainment[]
    }
  }

  // (ADMIN) Xóa nhiều mục giải trí
  static async deleteMany(ids: string[]) {
    return await Entertainment.deleteMany({ _id: { $in: ids } })
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách giải trí cho người dùng
  static async getForUser(options: { userId: string; type?: 'movie' | 'music' | 'podcast' }) {
    const { userId, type } = options
    const entQuery: any = {}
    if (type) entQuery.type = type
    const [items, interactions] = await Promise.all([
      Entertainment.find(entQuery).populate('videoUrl', 'url subtitles').populate('thumbnailUrl', 'url').sort({ createdAt: -1 }).lean(),
      EntertainmentInteraction.find({ userId }).lean()
    ])
    const key = (id: any) => String(id)
    const map = new Map<string, { liked: boolean; watched: boolean }>()
    interactions.forEach(it => { map.set(key(it.entertainmentId), { liked: !!it.liked, watched: !!it.watched }) })
    const data = items.map(it => {
      const mapped = this.mapEntertainmentDoc(it)
      return {
        ...mapped,
        userFlags: map.get(key(it._id)) || { liked: false, watched: false },
        isVipRequired: mapped.isVipRequired !== undefined ? mapped.isVipRequired : true
      }
    })
    await this.syncUserStats(userId, type)
    return data
  }

  // (USER) Lấy chi tiết giải trí cho người dùng
  static async getForUserById(options: { userId: string; entertainmentId: string }) {
    const { userId, entertainmentId } = options
    const entertainment = await Entertainment.findById(entertainmentId)
      .populate('videoUrl', 'url type format size duration subtitles')
      .populate('thumbnailUrl', 'url type format size width height')
    if (!entertainment) throw new ErrorHandler('Entertainment không tồn tại', 404)

    const [interaction, likesCount, commentsCount] = await Promise.all([
      EntertainmentInteraction.findOne({ userId, entertainmentId }).lean(),
      EntertainmentInteraction.countDocuments({ entertainmentId, liked: true }),
      EntertainmentComment.countDocuments({ entertainmentId })
    ])
    const mapped = this.mapEntertainmentDoc(entertainment)

    return {
      ...mapped,
      userFlags: {
        liked: !!interaction?.liked,
        watched: !!interaction?.watched
      },
      likesCount,
      commentsCount,
      isVipRequired: mapped.isVipRequired !== undefined ? mapped.isVipRequired : true
    }
  }

  // (USER) Bật/tắt trạng thái like cho entertainment
  static async toggleLike(options: { userId: string; entertainmentId: string }) {
    const { userId, entertainmentId } = options
    const entertainment = await Entertainment.findById(entertainmentId).select('_id')
    if (!entertainment) throw new ErrorHandler('Entertainment không tồn tại', 404)

    const interaction = await EntertainmentInteraction.findOneAndUpdate(
      { userId, entertainmentId },
      { $setOnInsert: { userId, entertainmentId }, $set: { type: entertainment.type || 'movie' } },
      { upsert: true, new: true }
    )

    interaction.liked = !interaction.liked
    await interaction.save()

    const likesCount = await EntertainmentInteraction.countDocuments({ entertainmentId, liked: true })
    return {
      liked: interaction.liked,
      likesCount
    }
  }

  // (USER) Lấy danh sách comment theo entertainment
  static async getComments(options: { entertainmentId: string }) {
    const { entertainmentId } = options
    const entertainment = await Entertainment.findById(entertainmentId).select('_id')
    if (!entertainment) throw new ErrorHandler('Entertainment không tồn tại', 404)

    const comments = await EntertainmentComment.find({ entertainmentId })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .lean()

    return comments.map((comment: any) => ({
      _id: String(comment._id),
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        _id: String(comment.userId?._id || ''),
        fullName: comment.userId?.fullName || 'Người dùng'
      }
    }))
  }

  // (USER) Tạo comment mới cho entertainment
  static async createComment(options: { userId: string; entertainmentId: string; content: string }) {
    const { userId, entertainmentId, content } = options
    const normalizedContent = String(content || '').trim()
    if (!normalizedContent) throw new ErrorHandler('Nội dung bình luận không được để trống', 400)

    const entertainment = await Entertainment.findById(entertainmentId).select('_id')
    if (!entertainment) throw new ErrorHandler('Entertainment không tồn tại', 404)

    const created = await EntertainmentComment.create({
      userId: new mongoose.Types.ObjectId(userId),
      entertainmentId: new mongoose.Types.ObjectId(entertainmentId),
      content: normalizedContent
    })

    const populated = await EntertainmentComment.findById(created._id)
      .populate('userId', 'fullName')
      .lean()

    if (!populated) throw new ErrorHandler('Không thể tạo bình luận', 500)

    return {
      _id: String(populated._id),
      content: populated.content,
      createdAt: populated.createdAt,
      user: {
        _id: String((populated as any).userId?._id || ''),
        fullName: (populated as any).userId?.fullName || 'Người dùng'
      }
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết giải trí theo ID
  static async getById(id: string) {
    const doc = await Entertainment.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('videoUrl', 'url type format size duration subtitles')
      .populate('thumbnailUrl', 'url type format size width height')
    if (!doc) throw new ErrorHandler('Entertainment không tồn tại', 404)
    return this.mapEntertainmentDoc(doc)
  }

  // (ADMIN) Tạo mục giải trí mới
  static async create(data: Partial<IEntertainment>, userId: string) {
    if (data.videoUrl) {
      const videoMedia = await Media.findById(data.videoUrl);
      if (!videoMedia) {
        throw new ErrorHandler('Video không tồn tại', 404);
      }
      if (!videoMedia.subtitles || videoMedia.subtitles.length === 0) {
        throw new ErrorHandler('Video chưa có subtitle. Vui lòng thêm subtitle cho video trước khi tạo entertainment content.', 400);
      }
    }

    const payload: any = { ...data, createdBy: new mongoose.Types.ObjectId(userId) }
    const created = await Entertainment.create(payload)
    return this.mapEntertainmentDoc(created)
  }

  // (ADMIN) Cập nhật mục giải trí
  static async update(id: string, data: Partial<IEntertainment>) {
    const updated = await Entertainment.findByIdAndUpdate(id, data, { new: true })
      .populate('createdBy', 'fullName email')
      .populate('videoUrl', 'url type format size duration subtitles')
      .populate('thumbnailUrl', 'url type format size width height')
    if (!updated) throw new ErrorHandler('Entertainment không tồn tại', 404)
    return this.mapEntertainmentDoc(updated)
  }

  // (ADMIN) Xóa mục giải trí
  static async delete(id: string) {
    const deleted = await Entertainment.findByIdAndDelete(id)
    if (!deleted) throw new ErrorHandler('Entertainment không tồn tại', 404)
    return deleted
  }

  // (ADMIN) Bật/tắt yêu cầu VIP
  static async toggleVipStatus(id: string) {
    const doc = await Entertainment.findById(id)
    if (!doc) throw new ErrorHandler('Entertainment không tồn tại', 404)
    doc.isVipRequired = !doc.isVipRequired
    await doc.save()
    return this.mapEntertainmentDoc(doc)
  }

  // (ADMIN) Bật/tắt trạng thái hoạt động
  static async toggleStatus(id: string) {
    const doc = await Entertainment.findById(id)
    if (!doc) throw new ErrorHandler('Entertainment không tồn tại', 404)
    doc.status = !doc.status
    await doc.save()
    return this.mapEntertainmentDoc(doc)
  }

  private static entertainmentTypes: Array<'movie' | 'music' | 'podcast'> = ['movie', 'music', 'podcast']

  private static async syncUserStats(userId: string, filterType?: 'movie' | 'music' | 'podcast') {
    const types = filterType ? [filterType] : this.entertainmentTypes
    const matchTypes = { $in: types }

    const totalsPromise = Entertainment.aggregate([
      {
        $match: {
          type: matchTypes,
          status: { $ne: false }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 }
        }
      }
    ])

    const watchedPromise = EntertainmentInteraction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          watched: true
        }
      },
      {
        $lookup: {
          from: 'entertainments',
          localField: 'entertainmentId',
          foreignField: '_id',
          as: 'entertainment'
        }
      },
      { $unwind: '$entertainment' },
      {
        $match: {
          'entertainment.type': matchTypes
        }
      },
      {
        $group: {
          _id: '$entertainment.type',
          viewedCount: { $sum: 1 },
          totalWatchTime: { $sum: { $ifNull: ['$totalWatchTime', 0] } }
        }
      }
    ])

    const [totals, watched] = await Promise.all([totalsPromise, watchedPromise])

    const totalsMap = new Map<string, number>()
    totals.forEach(entry => totalsMap.set(entry._id, entry.total))

    const watchedMap = new Map<string, { viewedCount: number; totalWatchTime: number }>()
    watched.forEach(entry => watchedMap.set(entry._id, {
      viewedCount: entry.viewedCount,
      totalWatchTime: entry.totalWatchTime
    }))

    await Promise.all(types.map(async (type) => {
      const statsPayload = {
        userId: new mongoose.Types.ObjectId(userId),
        type,
        totalItems: totalsMap.get(type) || 0,
        viewedCount: watchedMap.get(type)?.viewedCount || 0,
        totalWatchTime: watchedMap.get(type)?.totalWatchTime || 0,
        lastUpdated: new Date()
      }

      await EntertainmentStats.findOneAndUpdate(
        { userId: statsPayload.userId, type },
        { $set: statsPayload },
        { upsert: true }
      )
    }))
  }
}


