import { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middleware/CatchAsyncError';
import { SpeakingService } from '../services/speaking.service';
import { MediaService } from '../services/media.service';
import { ISpeaking } from '../models/speaking.model';
import ErrorHandler from '../utils/ErrorHandler';
import { UserInfo } from '../services/auth.service';
import { calculateStudyTimeSeconds } from '../utils/studyTime.util';

export class SpeakingController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu Speaking ra file Excel
  static exportSpeakingData = CatchAsyncError(async (req: Request, res: Response) => {
    const buffer = await SpeakingService.exportSpeakingData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="speaking_export.xlsx"')
    res.send(buffer)
  })

  // (ADMIN) Import dữ liệu Speaking từ JSON
  static importSpeakingJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { speakings, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(speakings)) return next(new ErrorHandler('Dữ liệu speakings phải là mảng', 400))

    const result = await SpeakingService.importSpeakingFromJson({
      speakings,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu speaking hoàn tất',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về Speaking
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await SpeakingService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan Speaking thành công',
      data: stats,
    })
  })

  // (ADMIN) Lấy thống kê chi tiết Speaking
  static getSpeakingStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await SpeakingService.getSpeakingStats();
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê bài nói thành công',
      data: stats
    });
  });

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài nói (có phân trang & tìm kiếm)
  static getAllSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = req.query
    const result = await SpeakingService.getAllSpeaking({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      isActive: isActive ? isActive === 'true' : undefined,
      createdBy: createdBy as string
    })

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài nói thành công',
      data: result.speakings as unknown as ISpeaking[],
      pagination: {
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.totalDocs,
        pages: result.totalPages,
        hasNext: result.hasNextPage || false,
        hasPrev: result.hasPrevPage || false,
        next: result.nextPage || null,
        prev: result.prevPage || null
      }
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài nói
  static updateMultipleSpeakingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400))
    }
    const result = await SpeakingService.updateMultipleSpeakingStatus(ids, isActive)
    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} bài nói`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều bài nói
  static deleteMultipleSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    const result = await SpeakingService.deleteMultipleSpeaking(ids);
    res.status(200).json({
      success: true,
      message: 'Xóa nhiều bài nói thành công',
      data: result
    });
  });

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách bài nói cho người dùng
  static getSpeakingByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    const speakings = await SpeakingService.getSpeakingByUser(userId);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài nói thành công',
      data: speakings
    });
  });

  // (USER) Lấy thông tin chi tiết bài nói theo ID cho người dùng
  static getSpeakingByIdForUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    const speaking = await SpeakingService.getSpeakingByIdForUser(id, userId);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết bài nói thành công',
      data: speaking
    });
  });

  // (USER) Thành tích đã lưu (StudyHistory + luyện từng câu)
  static getSpeakingResult = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    const data = await SpeakingService.getSpeakingResult(String(userId), id);
    res.status(200).json({
      success: true,
      message: 'Lấy thành tích bài nói thành công',
      data,
    });
  });

  // (USER) Lưu điểm tổng bài nói sau khi hoàn thành
  static saveHighestSpeakingScore = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInfo;
    const { lessonId } = req.params;
    const { sentenceEvaluations, studySession } = req.body;

    if (!user?._id || !lessonId || !sentenceEvaluations || !studySession) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    }

    if (!Array.isArray(sentenceEvaluations) || sentenceEvaluations.length === 0) {
      return next(new ErrorHandler('Dữ liệu sentenceEvaluations phải là mảng', 400));
    }

    const studyTimeSeconds = calculateStudyTimeSeconds(studySession);
    const result = await SpeakingService.saveHighestScore(user._id, lessonId, studyTimeSeconds, sentenceEvaluations);

    res.status(200).json({
      success: true,
      message: 'Đã lưu tiến độ học tập thành công',
      data: result,
    });
  });

  // (USER) Chấm điểm phát âm bài nói bằng AI
  static assessPronunciationSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { text, speakingId, studyTime } = req.body
    const userId = req.user?._id
    const audioFile = req.file as Express.Multer.File

    if (!audioFile || !text) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin (file âm thanh và văn bản)', 400))
    }

    const audioBuffer = Buffer.from(audioFile.buffer)
    const pronunciationResult = await SpeakingService.assessPronunciationSpeaking(
      text,
      audioBuffer,
    )

    res.status(200).json({
      success: true,
      message: 'Chấm điểm phát âm thành công',
      data: pronunciationResult,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy thông tin chi tiết bài nói theo ID
  static getSpeakingById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const speaking = await SpeakingService.getSpeakingById(id);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết bài nói thành công',
      data: speaking
    });
  });

  // (ADMIN) Tạo bài nói mới
  static createSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    const { title, videoUrl, level } = req.body;
    if (!title || !videoUrl || !level) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    }
    const speaking = await SpeakingService.createSpeaking({ ...req.body, createdBy: userId });
    res.status(201).json({
      success: true,
      message: 'Tạo bài nói thành công',
      data: speaking
    });
  });

  // (ADMIN) Cập nhật bài nói
  static updateSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, videoUrl, level } = req.body;
    if (!title || !videoUrl || !level) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    }
    const speaking = await SpeakingService.updateSpeaking(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài nói thành công',
      data: speaking
    });
  });

  // (ADMIN) Xóa một bài nói
  static deleteSpeaking = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const speaking = await SpeakingService.deleteSpeaking(id);
    res.status(200).json({
      success: true,
      message: 'Xóa bài nói thành công',
      data: speaking
    });
  });

  // (ADMIN) Bật/tắt trạng thái xuất bản bài nói
  static updateSpeakingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const speaking = await SpeakingService.updateSpeakingStatus(id);
    res.status(200).json({
      success: true,
      message: `Đã ${speaking.isActive ? 'xuất bản' : 'ẩn'} bài nói thành công`,
      data: speaking
    });
  });

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài nói
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const speaking = await SpeakingService.toggleVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${speaking.isVipRequired ? 'bật' : 'tắt'} VIP cho bài nghe này`,
      data: speaking,
    })
  })

  // (ADMIN) Thay đổi thứ tự bài nói (Lên/Xuống)
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { direction } = req.body;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID bài nói', 400));
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return next(new ErrorHandler('Direction phải là "up" hoặc "down"', 400));
    }
    const result = await SpeakingService.swapOrderIndex(id, direction);
    res.status(200).json({
      success: true,
      message: `Đã di chuyển bài nói ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });

  // (ADMIN) Tạo bài nói mới với video tải lên trực tiếp
  static createSpeakingWithVideo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    if (!req.file) return next(new ErrorHandler('Vui lòng tải lên video', 400));
    const videoMedia = await MediaService.uploadMedia({ filePath: req.file.path, userId });
    const speaking = await SpeakingService.createSpeaking({
      ...req.body,
      videoUrl: videoMedia._id,
      createdBy: userId
    }, true); // skipSubtitleCheck = true cho video mới tải lên
    res.status(201).json({
      success: true,
      message: 'Tạo bài nói thành công',
      data: { speaking, videoMedia }
    });
  });
}
