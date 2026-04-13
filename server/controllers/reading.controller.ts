import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { ReadingService } from "../services/reading.service";
import { IReading, IVocabularyReading } from "../models/reading.model";
import { IQuiz } from "../models/quiz.model";
import { IQuizResult } from "../models/quizzResult.model";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";
import { StreakService } from "../services/streak.service";

export class ReadingController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu Reading ra file Excel
  static exportReadingData = CatchAsyncError(async (req: Request, res: Response) => {
    const buffer = await ReadingService.exportReadingData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="reading_export.xlsx"')
    res.send(buffer)
  })

  // (ADMIN) Import dữ liệu Reading từ JSON
  static importReadingJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { readings, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(readings)) return next(new ErrorHandler('Dữ liệu readings phải là mảng', 400))

    const result = await ReadingService.importReadingFromJson({
      readings,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu reading hoàn tất',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về Reading
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await ReadingService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan Reading thành công',
      data: stats,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài đọc (có phân trang & tìm kiếm)
  static getAllReadingPaginated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = req.query

    const result = await ReadingService.getAllReadingPaginated({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      createdBy: createdBy as string
    })

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài đọc thành công',
      data: result,
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài đọc
  static updateMultipleReadingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400))
    }
    const result = await ReadingService.updateMultipleReadingStatus(ids, isActive)
    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} bài đọc`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều bài đọc
  static deleteMultipleReading = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body
    const readings = await ReadingService.deleteMultipleReading(ids)
    res.status(200).json({
      success: true,
      message: 'Xóa nhiều bài đọc thành công',
      data: readings
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách bài đọc cho người dùng
  static getReadingByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const reading = await ReadingService.getReadingByUser(userId)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài đọc thành công',
      data: reading
    })
  })

  // (USER/ALL) Lấy thông tin bài đọc theo ID
  static getReadingById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const reading = await ReadingService.getReadingById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy bài đọc thành công',
      data: reading
    })
  })

  // (USER) Nộp bài làm quiz bài đọc
  static doReadingQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { quizResults, studySession } = req.body
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession)
    const reading = await ReadingService.doReadingQuiz(id, req.user?._id as string, quizResults as IQuizResult[], studyTimeSeconds)
    await StreakService.updateStreak(req.user?._id as string)

    if (!reading) return next(new ErrorHandler('Làm bài đọc thất bại', 400))
    res.status(200).json({
      success: true,
      message: 'Làm bài đọc thành công',
      data: reading
    })
  })

  // (USER) Lấy kết quả bài đọc
  static getReadingResult = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const userId = req.user?._id as string
    const results = await ReadingService.getReadingResult(userId, id)
    res.status(200).json({
      success: true,
      message: 'Lấy kết quả bài đọc thành công',
      data: results
    })
  })

  // (USER) Lấy danh sách quiz của bài đọc
  static getQuizByReading = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const quizzes = await ReadingService.getQuizByReading(id)
    res.status(200).json({
      success: true,
      message: 'Lấy câu hỏi thành công',
      data: quizzes
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Tạo bài đọc mới
  static createReading = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, paragraphEn, paragraphVi, vocabulary, quizzes, image, level } = req.body
    if (!title || !description || !paragraphEn || !paragraphVi || !level) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const reading = await ReadingService.createReading({ title, description, paragraphEn, paragraphVi, vocabulary, quizzes, image, level, createdBy: req.user?._id as string } as unknown as IReading)
    res.status(201).json({
      success: true,
      message: 'Tạo bài đọc thành công',
      data: reading
    })
  })

  // (ADMIN) Cập nhật bài đọc
  static updateReading = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const reading = await ReadingService.updateReading(id, { ...(req.body || {}), updatedBy: req.user?._id as string } as unknown as IReading)
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài đọc thành công',
      data: reading
    })
  })

  // (ADMIN) Xóa một bài đọc
  static deleteReading = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const reading = await ReadingService.deleteReading(id)
    res.status(200).json({
      success: true,
      message: 'Xóa bài đọc thành công',
      data: reading
    })
  })

  // (ADMIN) Bật/tắt trạng thái xuất bản bài đọc
  static updateReadingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const reading = await ReadingService.updateReadingStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${reading.isActive ? 'xuất bản' : 'ẩn'} bài đọc thành công`,
      data: reading
    })
  })

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài đọc
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const reading = await ReadingService.toggleVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${reading.isVipRequired ? 'bật' : 'tắt'} VIP cho bài học này`,
      data: reading,
    })
  })

  // (ADMIN) Thay đổi thứ tự bài đọc (Lên/Xuống)
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { direction } = req.body;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID bài đọc', 400));
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return next(new ErrorHandler('Direction phải là "up" hoặc "down"', 400));
    }
    const result = await ReadingService.swapOrderIndex(id, direction);
    res.status(200).json({
      success: true,
      message: `Đã di chuyển bài đọc ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });

  // (ADMIN) Thêm quiz vào bài đọc
  static createQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { quiz } = req.body
    const reading = await ReadingService.createQuiz(id, quiz as IQuiz)
    res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: reading
    })
  })

  // (ADMIN) Xóa quiz khỏi bài đọc
  static deleteQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { quizId } = req.body
    const reading = await ReadingService.deleteQuiz(id, quizId)
    res.status(200).json({
      success: true,
      message: 'Xóa câu hỏi thành công',
      data: reading
    })
  })

  // (ADMIN) Thêm từ vựng vào bài đọc
  static createVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { vocabulary } = req.body
    const reading = await ReadingService.createVocabulary(id, vocabulary as IVocabularyReading)
    res.status(201).json({
      success: true,
      message: 'Tạo từ vựng thành công',
      data: reading
    })
  })

  // (ADMIN) Cập nhật từ vựng trong bài đọc
  static updateVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { vocabularyId, vocabulary } = req.body
    const readingUpdated = await ReadingService.updateVocabulary(id, vocabularyId, vocabulary as IVocabularyReading)
    res.status(200).json({
      success: true,
      message: 'Cập nhật từ vựng thành công',
      data: readingUpdated
    })
  })

  // (ADMIN) Xóa từ vựng khỏi bài đọc
  static deleteVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { vocabularyId } = req.body
    const reading = await ReadingService.deleteVocabulary(vocabularyId, id)
    res.status(200).json({
      success: true,
      message: 'Xóa từ vựng thành công',
      data: reading
    })
  })
}
