import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { Request, Response, NextFunction } from "express";
import { ListeningService } from "../services/listening.service";
import ErrorHandler from "../utils/ErrorHandler";
import { IListening } from "../models/listening.model";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";

export class ListeningController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu Listening ra file Excel
  static exportListeningData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const buf = await ListeningService.exportListeningData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="listening_export.xlsx"')
    res.status(200).send(buf)
  })

  // (ADMIN) Import dữ liệu Listening từ JSON
  static importListeningJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { listenings, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(listenings)) return next(new ErrorHandler('Dữ liệu listenings phải là mảng', 400))

    const result = await ListeningService.importListeningFromJson({
      listenings,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu listening hoàn tất',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về Listening
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await ListeningService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan Listening thành công',
      data: stats,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách bài nghe (có phân trang & tìm kiếm)
  static getAllListening = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = req.query

    const result = await ListeningService.getAllListening({
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
      message: 'Lấy danh sách listening thành công',
      data: result.listenings,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        pages: result.totalPages,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage,
        next: result.nextPage,
        prev: result.prevPage
      }
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều bài nghe
  static updateMultipleListeningStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400))
    }

    const result = await ListeningService.updateMultipleListeningStatus(ids, isActive)

    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} bài nghe`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều bài nghe
  static deleteMultipleListening = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body
    const listenings = await ListeningService.deleteMultipleListening(ids)
    res.status(200).json({
      success: true,
      message: 'Xóa nhiều bài nghe thành công',
      data: listenings
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách bài nghe cho người dùng
  static getListeningList = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const listening = await ListeningService.getListeningList(userId)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài nghe thành công',
      data: listening
    })
  })

  // (USER/ALL) Lấy thông tin chi tiết bài nghe theo ID
  static getListeningById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const listening = await ListeningService.getListeningById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy bài nghe thành công',
      data: listening
    })
  })

  // (USER) Nộp bài làm quiz bài nghe
  static doListeningQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const userId = req.user?._id as string
    const { time, result, studySession } = req.body
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession)
    const listening = await ListeningService.doListeningQuiz(userId, id, time, result, studyTimeSeconds)
    const { StreakService } = await import('../services/streak.service')
    await StreakService.update(userId)
    res.status(200).json({
      success: true,
      message: 'Làm bài nghe thành công',
      data: listening
    })
  })

  // (USER) Lấy kết quả bài nghe
  static getListeningResult = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const userId = req.user?._id as string
    const listening = await ListeningService.getListeningResult(userId, id)
    res.status(200).json({
      success: true,
      message: 'Lấy kết quả bài nghe thành công',
      data: listening
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Danh sách câu quiz (ListeningQuiz) của một bài nghe
  static getListeningQuizzes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const data = await ListeningService.getListeningQuizzes(id)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách câu quiz thành công',
      data,
    })
  })

  // (ADMIN) Thêm một câu quiz
  static addListeningQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { question, options, answer } = req.body
    if (!question || !Array.isArray(options) || options.length === 0 || !answer) {
      return next(new ErrorHandler('Thiếu question, options hoặc answer không hợp lệ', 400))
    }
    const data = await ListeningService.addListeningQuiz(id, { question, options, answer })
    res.status(201).json({
      success: true,
      message: 'Thêm câu quiz thành công',
      data,
    })
  })

  // (ADMIN) Cập nhật một câu quiz
  static updateListeningQuizItem = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id, quizId } = req.params
    const { question, options, answer } = req.body
    if (!question || !Array.isArray(options) || options.length === 0 || !answer) {
      return next(new ErrorHandler('Thiếu question, options hoặc answer không hợp lệ', 400))
    }
    const data = await ListeningService.updateListeningQuizItem(id, quizId, { question, options, answer })
    res.status(200).json({
      success: true,
      message: 'Cập nhật câu quiz thành công',
      data,
    })
  })

  // (ADMIN) Xóa một câu quiz
  static deleteListeningQuizItem = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id, quizId } = req.params
    await ListeningService.deleteListeningQuizItem(id, quizId)
    res.status(200).json({
      success: true,
      message: 'Xóa câu quiz thành công',
    })
  })

  // (ADMIN) Tạo bài nghe mới
  static createListening = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, audio, subtitle, subtitleVi, level, quiz } = req.body
    if (!title || !description || !audio || !subtitle || !subtitleVi || !level) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const listening = await ListeningService.createListening({ title, description, audio, subtitle, subtitleVi, level, quiz, createdBy: req.user?._id as string } as unknown as IListening)
    res.status(201).json({
      success: true,
      message: 'Tạo bài nghe thành công',
      data: listening
    })
  })

  // (ADMIN) Cập nhật nội dung bài nghe
  static updateListening = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const listening = await ListeningService.updateListening(id, { ...(req.body || {}), updatedBy: req.user?._id as string })
    res.status(200).json({
      success: true,
      message: 'Cập nhật bài nghe thành công',
      data: listening
    })
  })

  // (ADMIN) Xóa một bài nghe
  static deleteListening = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const listening = await ListeningService.deleteListening(id)
    res.status(200).json({
      success: true,
      message: 'Xóa bài nghe thành công',
      data: listening
    })
  })

  // (ADMIN) Bật/tắt trạng thái xuất bản bài nghe
  static updateListeningStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const listening = await ListeningService.updateListeningStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${listening.isActive ? 'xuất bản' : 'ẩn'} bài nghe thành công`,
      data: listening
    })
  })

  // (ADMIN) Bật/tắt yêu cầu VIP cho bài nghe
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const listening = await ListeningService.toggleVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${listening.isVipRequired ? 'bật' : 'tắt'} VIP cho bài nghe này`,
      data: listening,
    })
  })

  // (ADMIN) Thay đổi thứ tự bài nghe (Lên/Xuống)
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { direction } = req.body;

    if (!id) return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return next(new ErrorHandler('Direction phải là "up" hoặc "down"', 400));
    }

    const result = await ListeningService.swapOrderIndex(id, direction);

    res.status(200).json({
      success: true,
      message: `Đã di chuyển bài nghe ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });
}
