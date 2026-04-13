import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { Request, Response, NextFunction } from "express";
import { ListeningService } from "../services/listening.service";
import ErrorHandler from "../utils/ErrorHandler";
import { IListening } from "../models/listening.model";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";
import { AdminActivityService } from "../services/adminActivity.service";
import { StreakService } from "../services/streak.service";

export class ListeningController {
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
    await ListeningController.logAdminAction(req, {
      action: 'import_json',
      resourceType: 'listening',
      description: 'Import dữ liệu listening từ JSON',
      metadata: { total: result.total, created: result.created, updated: result.updated, skipped: result.skipped }
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
    await ListeningController.logAdminAction(req, {
      action: 'bulk_update_status',
      resourceType: 'listening',
      description: 'Cập nhật trạng thái hàng loạt listening',
      metadata: { idsCount: ids.length, isActive, updatedCount: result.updatedCount }
    })

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
    await ListeningController.logAdminAction(req, {
      action: 'bulk_delete',
      resourceType: 'listening',
      description: 'Xóa hàng loạt listening',
      metadata: { idsCount: Array.isArray(ids) ? ids.length : 0 }
    })
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
    const { time, result, studySession, mode } = req.body
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession)
    const listening = await ListeningService.doListeningQuiz(userId, id, time, result, studyTimeSeconds, mode)
    await StreakService.updateStreak(userId)
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
    await ListeningController.logAdminAction(req, {
      action: 'add_quiz_item',
      resourceType: 'listening',
      resourceId: id,
      description: 'Thêm câu quiz cho listening',
      metadata: { quizId: String((data as any)?._id || '') }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'update_quiz_item',
      resourceType: 'listening',
      resourceId: id,
      description: 'Cập nhật câu quiz listening',
      metadata: { quizId }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'delete_quiz_item',
      resourceType: 'listening',
      resourceId: id,
      description: 'Xóa câu quiz listening',
      metadata: { quizId }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'create',
      resourceType: 'listening',
      resourceId: String((listening as any)?._id || ''),
      description: 'Tạo mới bài nghe',
      metadata: { title: (listening as any)?.title, level: (listening as any)?.level }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'update',
      resourceType: 'listening',
      resourceId: id,
      description: 'Cập nhật bài nghe',
      metadata: { updatedFields: Object.keys(req.body || {}) }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'delete',
      resourceType: 'listening',
      resourceId: id,
      description: 'Xóa bài nghe'
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'toggle_status',
      resourceType: 'listening',
      resourceId: id,
      description: 'Bật/tắt trạng thái bài nghe',
      metadata: { isActive: (listening as any)?.isActive }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'toggle_vip',
      resourceType: 'listening',
      resourceId: id,
      description: 'Bật/tắt VIP cho bài nghe',
      metadata: { isVipRequired: (listening as any)?.isVipRequired }
    })
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
    await ListeningController.logAdminAction(req, {
      action: 'swap_order',
      resourceType: 'listening',
      resourceId: id,
      description: 'Hoán đổi thứ tự bài nghe',
      metadata: { direction }
    })

    res.status(200).json({
      success: true,
      message: `Đã di chuyển bài nghe ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });
}
