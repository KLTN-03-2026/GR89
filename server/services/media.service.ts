import cloudinary from "../config/cloudinary.config";
import { IMedia, Media, MediaSubtitle, MediaSubtitlePreview } from "../models/media.model";
import fs from 'fs';
import path from 'path';
import ErrorHandler from "../utils/ErrorHandler";
import crypto from 'crypto';
import fetch from 'node-fetch';
import { User } from "../models/user.model";
import { Vocabulary } from "../models/vocabulary.model";
import { VocabularyTopic } from "../models/vocabularyTopic.model";
import { Reading } from "../models/reading.model";
import { Listening } from "../models/listening.model";
import { Speaking } from "../models/speaking.model";
import { Ipa } from "../models/ipa.model";
import { Entertainment } from "../models/entertainment.model";

interface IUploadMedia {
  filePath: string;
  userId: string;
  originalName?: string;
}

interface IUploadMedias {
  files: Express.Multer.File[];
  userId: string
}

const DEFAULT_SUBTITLE_LABEL = 'EN · IPA · VI'
const DEFAULT_LANGUAGE_PAIR = 'en-vi'

export class MediaService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // LẤY MEDIA BẰNG ID
  static async getMediaById(id: string): Promise<IMedia | null> {
    try {
      return await Media.findById(id).populate('userId', 'fullName email') || null;
    }
    catch {
      return null
    }
  }

  // LẤY DANH SÁCH MEDIA VÀ PHÂN TRANG
  static async getMediaList(options: {
    page?: number
    limit?: number
    type?: 'image' | 'audio' | 'video'
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    const {
      page = 1,
      limit = 12,
      type,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    const query: any = {}
    if (type) query.type = type
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ]
    }

    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    const skip = (page - 1) * limit

    const [media, total] = await Promise.all([
      Media.find(query)
        .populate('userId', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Media.countDocuments(query)
    ])

    const pages = Math.ceil(total / limit) || 1

    return {
      media,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
        next: page < pages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      }
    };
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // TẢI LÊN NHIỀU MEDIA
  static async uploadMultipleMedia(dataUpload: IUploadMedias): Promise<IMedia[]> {
    const { files, userId } = dataUpload
    const uploadPromises = files.map((file) => {
      return this.uploadMedia({ filePath: file.path, userId, originalName: file.originalname })
    });

    const results = await Promise.all(uploadPromises);
    return results;
  }

  // XÓA NHIỀU MEDIA (safe delete: chỉ xóa các media không còn tham chiếu)
  static async deleteMany(mediaIds: string[]) {
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return { deletedCount: 0 };
    }

    // bỏ trùng + lọc rỗng
    const uniqueIds = Array.from(new Set(mediaIds.filter(Boolean)));

    // không cho xóa ảnh mặc định
    const protectedIds = ['69293c75f29d5312d6568881'];
    const candidateIds = uniqueIds.filter(id => !protectedIds.includes(id));

    if (candidateIds.length === 0) {
      return { deletedCount: 0 };
    }

    // lấy media thực sự tồn tại
    const medias = await Media.find({ _id: { $in: candidateIds } }).select('_id publicId');
    if (medias.length === 0) {
      return { deletedCount: 0 };
    }

    const deletableIds: string[] = [];
    const blockedItems: { mediaId: string; usedIn: string[] }[] = [];

    // kiểm tra từng media giống deleteOne
    for (const media of medias) {
      const checks = [
        { label: 'User.avatar', query: User.exists({ avatar: media._id }) },
        { label: 'Vocabulary.image', query: Vocabulary.exists({ image: media._id }) },
        { label: 'VocabularyTopic.image', query: VocabularyTopic.exists({ image: media._id }) },
        { label: 'Reading.image', query: Reading.exists({ image: media._id }) },
        { label: 'Listening.audio', query: Listening.exists({ audio: media._id }) },
        { label: 'Speaking.audio', query: Speaking.exists({ audio: media._id }) },
        {
          label: 'Ipa.image/audio',
          query: Ipa.exists({ $or: [{ image: media._id }, { audio: media._id }] })
        },
        {
          label: 'Entertainment.videoUrl/thumbnailUrl',
          query: Entertainment.exists({
            $or: [{ videoUrl: media._id }, { thumbnailUrl: media._id }]
          })
        },
        { label: 'Media.thumbnail', query: Media.exists({ thumbnail: media._id }) },
      ];

      const results = await Promise.all(checks.map(c => c.query));
      const usedIn = checks
        .filter((_, idx) => Boolean(results[idx]))
        .map(c => c.label);

      if (usedIn.length > 0) {
        blockedItems.push({
          mediaId: String(media._id),
          usedIn
        });
      } else {
        deletableIds.push(String(media._id));
      }
    }

    // nếu không có cái nào xóa được thì báo lỗi giống deleteOne
    if (deletableIds.length === 0) {
      const detail = blockedItems
        .map(item => `${item.mediaId}: ${item.usedIn.join(', ')}`)
        .join(' | ');
      throw new ErrorHandler(`Không thể xóa media vì đang được sử dụng ở: ${detail}`, 409);
    }

    // xóa cloudinary cho các media có thể xóa
    const deletableMedias = medias.filter(m => deletableIds.includes(String(m._id)));
    const publicIds = deletableMedias
      .map(m => m.publicId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    // xóa db
    const deleteResult = await Media.deleteMany({ _id: { $in: deletableIds } });

    return {
      deletedCount: Number(deleteResult?.deletedCount || 0),
      requestedCount: uniqueIds.length,
      blockedCount: blockedItems.length,
      protectedCount: uniqueIds.filter(id => protectedIds.includes(id)).length,
      blockedItems, // để FE biết cái nào đang bị dùng
    };
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // TẠO VIDEO TỪ URL
  static async createVideoFromUrl(videoUrl: string, userId: string): Promise<IMedia> {
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new ErrorHandler('Thiếu videoUrl hợp lệ', 400)
    }

    // Kiểm tra xem đã có media với URL này chưa
    const existing = await Media.findOne({
      $or: [
        { url: videoUrl },
        { url: { $regex: videoUrl.split('/').pop() || '' } }
      ]
    }).lean()
    if (existing) {
      return existing as IMedia
    }

    // Xử lý YouTube/Vimeo
    if (this.extractYouTubeId(videoUrl)) {
      return await this.uploadVideoFromYoutube(videoUrl, userId)
    }
    if (this.extractVimeoId(videoUrl)) {
      return await this.uploadVideoFromVimeo(videoUrl, userId)
    }

    // Tải video về server tạm thời
    const uploadDir = 'uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const tempFilePath = path.join(uploadDir, `temp-video-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mp4`)

    try {
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new ErrorHandler(`Không thể tải video từ URL: ${response.statusText}`, 400)
      }

      const buffer = await response.buffer()
      fs.writeFileSync(tempFilePath, buffer)

      const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'english-learning',
        resource_type: 'video',
      })

      this.deleteTempFile(tempFilePath)

      return await Media.create({
        type: 'video',
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        format: cloudinaryResult.format,
        size: cloudinaryResult.bytes,
        duration: cloudinaryResult.duration,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        userId,
      })
    } catch (error: any) {
      this.deleteTempFile(tempFilePath)
      if (error instanceof ErrorHandler) throw error
      throw new ErrorHandler(`Không thể tải và lưu video từ URL: ${error?.message || 'Lỗi không xác định'}`, 400)
    }
  }

  // TẠO AUDIO TỪ URL
  static async createAudioFromUrl(audioUrl: string, userId: string): Promise<IMedia> {
    if (!audioUrl || typeof audioUrl !== 'string') {
      throw new ErrorHandler('Thiếu audioUrl hợp lệ', 400)
    }

    const existing = await Media.findOne({
      $or: [
        { url: audioUrl },
        { url: { $regex: audioUrl.split('/').pop() || '' } }
      ]
    }).lean()
    if (existing) {
      return existing as IMedia
    }

    const uploadDir = 'uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const tempFilePath = path.join(uploadDir, `temp-audio-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mp3`)

    try {
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new ErrorHandler(`Không thể tải audio từ URL: ${response.statusText}`, 400)
      }

      const buffer = await response.buffer()
      fs.writeFileSync(tempFilePath, buffer)

      const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'english-learning',
        resource_type: 'raw',
      })

      this.deleteTempFile(tempFilePath)

      return await Media.create({
        type: 'audio',
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        format: cloudinaryResult.format,
        size: cloudinaryResult.bytes,
        duration: cloudinaryResult.duration,
        userId,
      })
    } catch (error: any) {
      this.deleteTempFile(tempFilePath)
      if (error instanceof ErrorHandler) throw error
      throw new ErrorHandler(`Không thể tải và lưu audio từ URL: ${error?.message || 'Lỗi không xác định'}`, 400)
    }
  }

  // TẠO ẢNH TỪ URL
  static async createImageFromUrl(imageUrl: string, userId: string): Promise<IMedia> {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new ErrorHandler('Thiếu imageUrl hợp lệ', 400)
    }

    // Kiểm tra xem đã có media với URL này chưa (bao gồm cả URL gốc và URL Cloudinary)
    const existing = await Media.findOne({
      $or: [
        { url: imageUrl },
        { url: { $regex: imageUrl.split('/').pop() } } // Tìm theo tên file
      ]
    }).lean()
    if (existing) {
      return existing as IMedia
    }

    // Tải ảnh về server tạm thời
    const uploadDir = 'uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const tempFilePath = path.join(uploadDir, `temp-image-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`)

    try {
      // Tải ảnh từ URL
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new ErrorHandler(`Không thể tải ảnh từ URL: ${response.statusText}`, 400)
      }

      const buffer = await response.buffer()
      fs.writeFileSync(tempFilePath, buffer)

      // Upload lên Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'english-learning',
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      })

      // Xóa file tạm
      this.deleteTempFile(tempFilePath)

      // Lưu vào database với URL Cloudinary (vĩnh viễn)
      const media = await Media.create({
        type: 'image',
        url: cloudinaryResult.secure_url, // URL Cloudinary thay vì URL gốc
        publicId: cloudinaryResult.public_id,
        format: cloudinaryResult.format,
        size: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        duration: 0,
        userId,
      })

      return media
    } catch (error: any) {
      // Xóa file tạm nếu có lỗi
      this.deleteTempFile(tempFilePath)

      if (error instanceof ErrorHandler) {
        throw error
      }
      throw new ErrorHandler(`Không thể tải và lưu ảnh từ URL: ${error?.message || 'Lỗi không xác định'}`, 400)
    }
  }

  // LƯU ẢNH TỪ PIXABAY
  static async saveImageFromPixabay(imageUrl: string, metadata: {
    width: number
    height: number
    format: string
    imageId: number
  }, userId: string): Promise<string> {
    // Sử dụng createImageFromUrl để tải về và upload lên Cloudinary
    const media = await this.createImageFromUrl(imageUrl, userId)
    return media._id as unknown as string
  }

  // TẢI LÊN 1 MEDIA
  // TẢI LÊN ẢNH RAW (DÀNH CHO EDITOR, KHÔNG LƯU VÀO COLLECTION MEDIA)
  static async uploadRawImage(filePath: string): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'english-editor',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      // Xóa file tạm
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error: any) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new ErrorHandler(`Lỗi upload ảnh: ${error?.message || 'Lỗi không xác định'}`, 400);
    }
  }

  static async uploadMedia(uploadData: IUploadMedia): Promise<IMedia> {
    const { filePath, userId, originalName } = uploadData;

    // tải media lên Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'english-learning',
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    const normalizedTitle = this.getTitleFromFileName(originalName);

    const newMedia = await Media.create({
      type: this.getMediaType(result),
      url: result.secure_url,
      publicId: result.public_id,
      title: normalizedTitle,
      format: result.format,
      size: result.bytes,
      duration: result.duration,
      width: result.width,
      height: result.height,
      userId: userId,
    })

    // Xóa file tạm
    this.deleteTempFile(filePath);

    return newMedia
  }

  private static getTitleFromFileName(fileName?: string): string {
    if (!fileName) return ''
    const title = path.parse(fileName).name.trim()
    return title
  }

  // TẢI LÊN VIDEO TỪ YOUTUBE
  static async uploadVideoFromYoutube(youtubeUrl: string, userId: string): Promise<IMedia> {
    const videoId = this.extractYouTubeId(youtubeUrl);
    if (!videoId || videoId.length !== 11) {
      throw new Error('Video ID không hợp lệ');
    }

    // Lưu YouTube URL trực tiếp
    const newMedia = await Media.create({
      type: 'video',
      url: `https://www.youtube.com/watch?v=${videoId}`, // Lưu YouTube URL
      publicId: `youtube_${videoId}`, // Tạo publicId riêng cho YouTube
      format: 'youtube',
      size: 0,
      duration: 0,
      width: 0,
      height: 0,
      userId: userId,
    })

    return newMedia
  }

  // TẢI LÊN VIDEO TỪ VIMEO
  static async uploadVideoFromVimeo(vimeoUrl: string, userId: string): Promise<IMedia> {
    const videoId = this.extractVimeoId(vimeoUrl)
    if (!videoId) {
      throw new Error('URL Vimeo không hợp lệ')
    }

    const canonicalUrl = `https://vimeo.com/${videoId}`

    let width = 0
    let height = 0
    let duration = 0

    try {
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(canonicalUrl)}`
      const response = await fetch(oembedUrl)
      if (response.ok) {
        const data = await response.json() as { width?: number; height?: number; duration?: number }
        width = data.width || 0
        height = data.height || 0
        duration = data.duration || 0
      }
    } catch (error) {
      console.warn('Không thể lấy metadata Vimeo:', error)
    }

    const newMedia = await Media.create({
      type: 'video',
      url: canonicalUrl,
      publicId: `vimeo_${videoId}`,
      format: 'vimeo',
      size: 0,
      duration,
      width,
      height,
      userId
    })

    return newMedia
  }

  // XÓA 1 MEDIA (safe delete: chỉ xóa khi không còn tham chiếu)
  static async deleteOne(mediaId: string): Promise<IMedia | null> {
    if (!mediaId) {
      throw new ErrorHandler('Vui lòng cung cấp mediaId', 400);
    }

    if (mediaId === '69293c75f29d5312d6568881') {
      throw new ErrorHandler('Không thể xóa ảnh mặc định', 400);
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      throw new ErrorHandler('Media không tồn tại', 404);
    }

    // Danh sách nơi có thể đang tham chiếu media này
    const checks = [
      { label: 'User.avatar', query: User.exists({ avatar: media._id }) },
      { label: 'Vocabulary.image', query: Vocabulary.exists({ image: media._id }) },
      { label: 'VocabularyTopic.image', query: VocabularyTopic.exists({ image: media._id }) },
      { label: 'Reading.image', query: Reading.exists({ image: media._id }) },
      { label: 'Listening.audio', query: Listening.exists({ audio: media._id }) },
      { label: 'Speaking.audio', query: Speaking.exists({ audio: media._id }) },
      {
        label: 'Ipa.image/audio',
        query: Ipa.exists({ $or: [{ image: media._id }, { audio: media._id }] })
      },
      {
        label: 'Entertainment.videoUrl/thumbnailUrl',
        query: Entertainment.exists({
          $or: [{ videoUrl: media._id }, { thumbnailUrl: media._id }]
        })
      },
      { label: 'Media.thumbnail', query: Media.exists({ thumbnail: media._id }) },
    ];

    const results = await Promise.all(checks.map((c) => c.query));
    const usedIn = checks
      .filter((_, idx) => Boolean(results[idx]))
      .map((c) => c.label);

    if (usedIn.length > 0) {
      throw new ErrorHandler(
        `Không thể xóa media vì đang được sử dụng ở: ${usedIn.join(', ')}`,
        409
      );
    }

    // Không còn tham chiếu -> xóa cloud + db
    if (media.publicId) {
      // Nếu cần xử lý riêng raw/video có thể thêm options resource_type tương ứng
      await cloudinary.uploader.destroy(media.publicId);
    }

    return await Media.findByIdAndDelete(media._id);
  }

  // TẢI LÊN FILE SUBTITLE (.SRT)
  static async uploadSubtitleFile(filePath: string, userId: string): Promise<{ fileUrl: string; format: string; originalName: string }> {
    const originalName = filePath.split(/[/\\]/).pop() || 'subtitle.srt';

    // Upload to Cloudinary as raw file
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'english-learning/subtitles',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: false
    });

    // Delete temp file
    this.deleteTempFile(filePath);

    return {
      fileUrl: result.secure_url,
      format: 'srt',
      originalName
    };
  }

  // CẬP NHẬT SUBTITLE CHO MEDIA
  static async updateMediaSubtitle(
    mediaId: string,
    userId: string,
    subtitleData: MediaSubtitle
  ): Promise<IMedia> {
    const media = await Media.findOne({ _id: mediaId, userId });
    if (!media) {
      throw new ErrorHandler('Media không tồn tại hoặc bạn không có quyền cập nhật', 404);
    }

    // Use preview from subtitleData if provided (frontend already parsed it)
    // Otherwise, try to parse from fileUrl if available
    let finalPreview: MediaSubtitlePreview[] = [];
    if (subtitleData.preview && subtitleData.preview.length > 0) {
      // Use full preview provided by frontend
      finalPreview = subtitleData.preview;
    } else if (subtitleData.fileUrl) {
      // Try to fetch and parse from Cloudinary URL (fallback)
      try {
        const https = require('https');
        const http = require('http');
        const url = require('url');
        const parsedUrl = new url.URL(subtitleData.fileUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const content = await new Promise<string>((resolve, reject) => {
          client.get(subtitleData.fileUrl, (res: any) => {
            let data = '';
            res.on('data', (chunk: string) => { data += chunk; });
            res.on('end', () => resolve(data));
            res.on('error', reject);
          });
        });

        const parsed = this.parseSrtFile(content);
        finalPreview = parsed;
      } catch (error) {
        console.error('Error parsing subtitle file from URL:', error);
        // If parsing fails, use empty preview
        finalPreview = [];
      }
    }

    // Update or add subtitle (replace existing if any)
    const subtitleToSave: MediaSubtitle = {
      label: subtitleData.label || DEFAULT_SUBTITLE_LABEL,
      languagePair: subtitleData.languagePair || DEFAULT_LANGUAGE_PAIR,
      fileUrl: subtitleData.fileUrl,
      format: subtitleData.format || 'srt',
      originalName: subtitleData.originalName,
      totalEntries: subtitleData.totalEntries || finalPreview.length,
      preview: finalPreview
    };

    // Replace existing subtitles array with new one (only one subtitle per media for now)
    media.subtitles = [subtitleToSave];
    await media.save();

    return media;
  }

  // XÓA SUBTITLE KHỎI MEDIA
  static async removeMediaSubtitle(mediaId: string, userId: string): Promise<IMedia> {
    const media = await Media.findOne({ _id: mediaId, userId });
    if (!media) {
      throw new ErrorHandler('Media không tồn tại hoặc bạn không có quyền cập nhật', 404);
    }

    // Delete subtitle files from Cloudinary if they exist
    if (media.subtitles && media.subtitles.length > 0) {
      for (const subtitle of media.subtitles) {
        if (subtitle.fileUrl) {
          try {
            // Extract public_id from Cloudinary URL
            const urlParts = subtitle.fileUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = `english-learning/subtitles/${filename.replace(/\.[^/.]+$/, '')}`;
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          } catch (error) {
            console.error('Error deleting subtitle file from Cloudinary:', error);
            // Continue even if deletion fails
          }
        }
      }
    }

    // Clear subtitles array
    media.subtitles = [];
    await media.save();

    return media;
  }

  // CẬP NHẬT TIÊU ĐỀ MEDIA
  static async updateMediaTitle(mediaId: string, userId: string, title: string): Promise<IMedia> {
    const media = await Media.findOne({ _id: mediaId, userId });
    if (!media) {
      throw new ErrorHandler('Media không tồn tại hoặc bạn không có quyền cập nhật', 404);
    }

    media.title = title.trim() || '';
    await media.save();

    return media;
  }

  // CÁC HÀM HỖ TRỢ (PRIVATE)
  private static getMediaType(result: any): 'image' | 'audio' | 'video' {
    // Kiểm tra nếu có is_audio flag
    if (result.is_audio === true) {
      return 'audio';
    }

    // Kiểm tra resource_type
    switch (result.resource_type) {
      case 'image': return 'image';
      case 'video': return 'video';
      case 'raw': return 'audio';
      default: return 'image';
    }
  }

  private static deleteTempFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private static extractYouTubeId(url: string): string | null {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split(/[?&]/)[0];
    }
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    }
    if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split(/[?&]/)[0];
    }
    return null;
  }

  private static extractVimeoId(url: string): string | null {
    const regex = /vimeo\.com\/(?:video\/|channels\/[\w]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|)(\d+)/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  }

  private static parseSrtFile(content: string): MediaSubtitlePreview[] {
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
    const entries: MediaSubtitlePreview[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length < 4) {
        throw new Error('Mỗi khối subtitle phải có 3 dòng nội dung: English, IPA, Vietnamese.');
      }

      const timeLine = lines[1];
      if (!timeLine.includes('-->')) continue;

      const [startRaw, endRaw] = timeLine.split('-->');
      const textLines = lines.slice(2);
      if (!startRaw || !endRaw) continue;

      const [english = '', phonetic = '', vietnamese = ''] = textLines;
      if (!english || !phonetic || !vietnamese) {
        throw new Error('File .srt phải chứa đủ English, phiên âm IPA và tiếng Việt ở mỗi đoạn.');
      }

      entries.push({
        start: startRaw.trim(),
        end: endRaw.trim(),
        english,
        phonetic,
        vietnamese,
        raw: block
      });
    }

    return entries;
  }
}