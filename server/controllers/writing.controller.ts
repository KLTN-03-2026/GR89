import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { WritingService } from "../services/writing.service";
import { IWriting } from "../models/writing.model";
import { UserInfo } from "../services/auth.service";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";
import { StreakService } from "../services/streak.service";

export class WritingController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu writing ra file Excel
  static exportWritingData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const buf = await WritingService.exportWritingData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="writing_export.xlsx"')
    res.status(200).send(buf)
  })

  // (ADMIN) Import dữ liệu writing từ JSON
  static importWritingJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { writings, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(writings)) return next(new ErrorHandler('Dữ liệu writings phải là mảng', 400))

    const result = await WritingService.importWritingFromJson({
      writings,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu writing hoàn tất',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về Writing
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await WritingService.getOverviewStats()

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan Writing thành công',
      data: stats,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài viết (có phân trang & tìm kiếm)
  static getAllWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = req.query

    const result = await WritingService.getAllWritingPaginated({
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
      message: 'Lấy danh sách bài viết thành công',
      data: result.docs,
      total: result.total,
      limit: result.limit,
      page: result.page,
      pages: result.pages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
      next: result.next,
      prev: result.prev,
      pagingCounter: result.pagingCounter
    })
  })

  // (ADMIN) Tạo bài viết mới
  static createWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, minWords, maxWords, duration, suggestedVocabulary, suggestedStructure, level } = req.body
    if (!title || !description || !minWords || !maxWords || !duration || !suggestedVocabulary || !suggestedStructure || !level) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const writing = await WritingService.createWriting({ title, description, minWords, maxWords, duration, suggestedVocabulary, suggestedStructure, level, createdBy: req.user?._id as string } as unknown as IWriting)
    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: writing
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài viết
  static updateMultipleWritingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400))
    }

    const result = await WritingService.updateMultipleWritingStatus(ids, isActive)

    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} bài viết`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều bài viết
  static deleteMultipleWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body
    const writings = await WritingService.deleteMultipleWriting(ids)
    res.status(200).json({
      success: true,
      message: 'Xóa nhiều bài viết thành công',
      data: writings
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách bài viết theo tiến độ của người dùng
  static getAllWritingByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInfo
    if (!user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    const writings = await WritingService.getAllWritingByUser(user._id)
    res.status(200).json({
      success: true,
      message: 'Lấy bài viết theo user thành công',
      data: writings
    })
  })

  // (USER/ALL) Lấy thông tin chi tiết bài viết theo ID
  static getWritingById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const writing = await WritingService.getWritingById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy bài viết theo id thành công',
      data: writing
    })
  })

  // (USER) Lấy kết quả làm bài của người dùng theo ID bài viết
  static getWritingResult = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const user = req.user as UserInfo
    const result = await WritingService.getWritingBestResult(user._id, id)
    res.status(200).json({
      success: true,
      message: 'Lấy thành tích của người dùng theo id thành công',
      data: result
    })
  })

  // (USER) AI chấm điểm và đánh giá bài viết
  static evaluateWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { content, studySession } = req.body
    const user = req.user as UserInfo

    if (!user) {
      return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    }

    const studyTimeSeconds = calculateStudyTimeSeconds(studySession)
    const result = await WritingService.evaluateWriting(id, content, user._id, studyTimeSeconds)
    await StreakService.updateStreak(user._id)
    res.status(200).json({
      success: true,
      message: 'AI đánh giá bài viết thành công',
      data: result
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Cập nhật bài viết
  static updateWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { title, description, minWords, maxWords, duration, suggestedVocabulary, suggestedStructure, level } = req.body
    const writing = await WritingService.updateWriting(id, { title, description, minWords, maxWords, duration, suggestedVocabulary, suggestedStructure, level, updatedBy: req.user?._id as string } as unknown as IWriting)
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: writing
    })
  })

  // (ADMIN) Xóa một bài viết theo ID
  static deleteWriting = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const writing = await WritingService.deleteWriting(id)
    res.status(200).json({
      success: true,
      message: 'Xóa bài viết thành công',
      data: writing
    })
  })

  // (ADMIN) Bật/tắt trạng thái hiển thị (Active) của bài viết
  static updateWritingStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const writing = await WritingService.updateWritingStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${writing.isActive ? 'xuất bản' : 'ẩn'} bài viết thành công`,
      data: writing
    })
  })

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài viết
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const writing = await WritingService.toggleVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${writing.isVipRequired ? 'bật' : 'tắt'} VIP cho bài học này`,
      data: writing,
    })
  })

  // (ADMIN) Thay đổi thứ tự hiển thị của bài viết (Lên/Xuống)
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { direction } = req.body;

    if (!id) return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return next(new ErrorHandler('Direction phải là "up" hoặc "down"', 400));
    }

    const result = await WritingService.swapOrderIndex(id, direction);

    res.status(200).json({
      success: true,
      message: `Đã di chuyển writing ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });
}
