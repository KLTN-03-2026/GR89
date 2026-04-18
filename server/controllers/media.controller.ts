import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { MediaService } from "../services/media.service";
import { MediaSubtitle } from "../models/media.model";
import { AdminActivityService } from "../services/adminActivity.service";

export class MediaController {
  private static async logAdminAction(req: Request, payload: {
    action: string
    resourceType: string
    resourceId?: string
    description: string
    metadata?: Record<string, any>
  }) {
    try {
      const adminId = req.user?._id as string
      const role = (req.user as any)?.role as 'admin' | 'content'
      if (!adminId || !role || !['admin', 'content'].includes(role)) return
      await AdminActivityService.logActivity({
        adminId,
        adminRole: role,
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        description: payload.description,
        metadata: payload.metadata,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined
      })
    } catch {
      // Không block luồng chính nếu log thất bại
    }
  }
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // LẤY MEDIA BẰNG ID
  static getMediaById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const media = await MediaService.getMediaById(id);

    if (!media) return next(new ErrorHandler('Media không tồn tại', 404));

    res.status(200).json({
      success: true,
      message: 'Lấy media thành công',
      data: media
    })
  })

  // LẤY DANH SÁCH MEDIA VÀ PHÂN TRANG
  static getMediaList = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit,
      type,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const result = await MediaService.getMediaList({
      page: Number(page),
      limit: Number(limit),
      type: type as 'image' | 'audio' | 'video' | undefined,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách media thành công',
      data: result.media,
      pagination: result.pagination
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // TẢI LÊN NHIỀU MEDIA
  static uploadMultipleMedia = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) return next(new ErrorHandler('Vui lòng tải lên file', 400));

    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));

    const media = await MediaService.uploadMultipleMedia(
      {
        files: req.files as Express.Multer.File[],
        userId,
      });
    await MediaController.logAdminAction(req, {
      action: 'upload_multiple',
      resourceType: 'media',
      description: 'Upload nhiều media',
      metadata: { filesCount: (req.files as Express.Multer.File[])?.length || 0 }
    })

    res.status(201).json({
      success: true,
      message: 'Upload nhiều media thành công',
      data: media
    });
  });

  // XÓA NHIỀU MEDIA
  static deleteManyMedia = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { ids } = req.body as { ids: string[] };

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));
    if (!Array.isArray(ids) || ids.length === 0) return next(new ErrorHandler('Vui lòng cung cấp danh sách ids', 400));

    const result = await MediaService.deleteMany(ids);
    await MediaController.logAdminAction(req, {
      action: 'bulk_delete',
      resourceType: 'media',
      description: 'Xóa nhiều media',
      metadata: { idsCount: ids.length, deletedCount: (result as any)?.deletedCount || 0 }
    })

    res.status(200).json({
      success: true,
      message: 'Xóa nhiều media hoàn tất',
      data: result
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // TẢI LÊN 1 MEDIA
  static uploadMedia = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new ErrorHandler('Vui lòng tải lên file', 400));

    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));

    const media = await MediaService.uploadMedia(
      {
        filePath: req.file.path,
        userId,
        originalName: req.file.originalname,
      }
    );
    await MediaController.logAdminAction(req, {
      action: 'upload_single',
      resourceType: 'media',
      resourceId: String((media as any)?._id || ''),
      description: 'Upload media'
    })

    res.status(201).json({
      success: true,
      message: 'Upload media thành công',
      data: media
    });
  })

  // TẢI LÊN VIDEO TỪ YOUTUBE
  static uploadVideoFromYoutube = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { youtubeUrl } = req.body;
    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));

    if (!youtubeUrl) return next(new ErrorHandler('Vui lòng nhập đường dẫn video từ YouTube', 400));

    const media = await MediaService.uploadVideoFromYoutube(youtubeUrl, userId);
    await MediaController.logAdminAction(req, {
      action: 'upload_youtube',
      resourceType: 'media',
      resourceId: String((media as any)?._id || ''),
      description: 'Upload video từ Youtube',
      metadata: { youtubeUrl }
    })
    res.status(201).json({
      success: true,
      message: 'Upload video từ YouTube thành công',
      data: media
    });
  })

  // TẢI LÊN VIDEO TỪ VIMEO
  static uploadVideoFromVimeo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { vimeoUrl } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404))
    if (!vimeoUrl) return next(new ErrorHandler('Vui lòng nhập đường dẫn video từ Vimeo', 400))

    const media = await MediaService.uploadVideoFromVimeo(vimeoUrl, userId)
    await MediaController.logAdminAction(req, {
      action: 'upload_vimeo',
      resourceType: 'media',
      resourceId: String((media as any)?._id || ''),
      description: 'Upload video từ Vimeo',
      metadata: { vimeoUrl }
    })

    res.status(201).json({
      success: true,
      message: 'Upload video từ Vimeo thành công',
      data: media
    })
  })

  // XÓA MEDIA (1)
  static deleteMedia = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deleted = await MediaService.deleteOne(id);
    await MediaController.logAdminAction(req, {
      action: 'delete',
      resourceType: 'media',
      resourceId: id,
      description: 'Xóa media'
    })

    res.status(200).json({
      success: true,
      message: 'Xóa media thành công',
      data: deleted
    })
  })

  // TẢI LÊN FILE SUBTITLE (.SRT)
  static uploadSubtitleFile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new ErrorHandler('Vui lòng tải lên file subtitle', 400));

    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));

    // Validate file extension
    if (!req.file.originalname.toLowerCase().endsWith('.srt')) {
      return next(new ErrorHandler('Chỉ chấp nhận file .srt cho subtitle', 400));
    }

    const result = await MediaService.uploadSubtitleFile(req.file.path, userId);
    await MediaController.logAdminAction(req, {
      action: 'upload_subtitle_file',
      resourceType: 'media',
      resourceId: String((result as any)?._id || ''),
      description: 'Upload file subtitle cho media'
    })

    res.status(201).json({
      success: true,
      message: 'Upload subtitle file thành công',
      data: result
    });
  })

  // CẬP NHẬT SUBTITLE CHO MEDIA
  static updateMediaSubtitle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { mediaId } = req.params;
    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));
    if (!mediaId) return next(new ErrorHandler('Vui lòng cung cấp media ID', 400));

    const subtitleData = req.body as MediaSubtitle;
    if (!subtitleData.fileUrl) {
      return next(new ErrorHandler('Vui lòng cung cấp fileUrl cho subtitle', 400));
    }

    const media = await MediaService.updateMediaSubtitle(mediaId, userId, subtitleData);
    await MediaController.logAdminAction(req, {
      action: 'update_subtitle',
      resourceType: 'media',
      resourceId: mediaId,
      description: 'Cập nhật subtitle cho media'
    })

    res.status(200).json({
      success: true,
      message: 'Cập nhật subtitle thành công',
      data: media
    });
  })

  // XÓA SUBTITLE KHỎI MEDIA
  static removeMediaSubtitle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { mediaId } = req.params;
    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));
    if (!mediaId) return next(new ErrorHandler('Vui lòng cung cấp media ID', 400));

    const media = await MediaService.removeMediaSubtitle(mediaId, userId);
    await MediaController.logAdminAction(req, {
      action: 'remove_subtitle',
      resourceType: 'media',
      resourceId: mediaId,
      description: 'Xóa subtitle khỏi media'
    })

    res.status(200).json({
      success: true,
      message: 'Xóa subtitle thành công',
      data: media
    });
  })

  // CẬP NHẬT TIÊU ĐỀ MEDIA
  static updateMediaTitle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?._id;

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp media ID', 400));

    const media = await MediaService.updateMediaTitle(id, userId, title || '');
    await MediaController.logAdminAction(req, {
      action: 'update_title',
      resourceType: 'media',
      resourceId: id,
      description: 'Cập nhật tên media'
    })

    res.status(200).json({
      success: true,
      message: 'Cập nhật tên media thành công',
      data: media
    });
  })
}