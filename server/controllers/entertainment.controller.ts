import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'
import { EntertainmentService } from '../services/entertainment.service'
import fs from 'fs'

export class EntertainmentController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan giải trí
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await EntertainmentService.getOverviewStats()
    res.status(200).json({ success: true, message: 'Lấy thống kê tổng quan giải trí thành công', data: stats })
  })

  // (USER) Lấy thống kê giải trí cho người dùng
  static getStatsForUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const data = await EntertainmentService.getStatsForUser(userId)
    res.status(200).json({ success: true, message: 'Lấy thống kê giải trí thành công', data })
  })

  // (ADMIN) Export dữ liệu giải trí ra Excel
  static exportEntertainmentData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const type = req.query.type as 'movie' | 'music' | 'podcast'
    const buffer = await EntertainmentService.exportEntertainmentData(type)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=entertainment-data-${new Date().getTime()}.xlsx`)
    res.send(buffer)
  })

  // (ADMIN) Import dữ liệu giải trí từ JSON
  static importEntertainmentJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    const { items, skipErrors, type: defaultType } = req.body
    if (!items || !Array.isArray(items)) {
      return next(new ErrorHandler('Dữ liệu JSON không hợp lệ', 400))
    }

    const result = await EntertainmentService.importEntertainmentFromJson({
      items,
      userId,
      skipErrors: !!skipErrors,
      defaultType
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu giải trí từ JSON hoàn tất',
      data: result
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách giải trí (có phân trang & tìm kiếm)
  static getAllPaginated = CatchAsyncError(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', status, createdBy, type, parentId } = req.query
    const result = await EntertainmentService.getAllPaginated({
      page: Number(page),
      limit: Number(limit),
      search: String(search || ''),
      sortBy: String(sortBy || 'createdAt'),
      sortOrder: (String(sortOrder || 'desc') as 'asc' | 'desc'),
      status: status === 'true' ? true : status === 'false' ? false : undefined,
      createdBy: createdBy as string,
      type: (type as any) || undefined,
      parentId: parentId as string
    })
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách giải trí thành công',
      data: result.entertainments,
      pagination: {
        page: (result as any).page,
        limit: (result as any).limit,
        total: result.totalDocs,
        pages: result.totalPages,
        hasNext: (result as any).hasNext,
        hasPrev: (result as any).hasPrev,
        next: (result as any).next,
        prev: (result as any).prev
      }
    })
  })

  // (ADMIN) Cập nhật trạng thái cho nhiều mục giải trí
  static updateMultipleEntertainmentStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof status !== 'boolean') {
      return next(new ErrorHandler('Trạng thái phải là giá trị boolean', 400))
    }

    const result = await EntertainmentService.updateMultipleEntertainmentStatus(ids, status)

    res.status(200).json({
      success: true,
      message: `Đã ${status ? 'hiển thị' : 'ẩn'} ${result.updatedCount} mục giải trí thành công`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều mục giải trí
  static deleteMany = CatchAsyncError(async (req: Request, res: Response) => {
    const { ids } = req.body
    const data = await EntertainmentService.deleteMany(ids)
    res.status(200).json({ success: true, message: 'Xóa nhiều mục giải trí thành công', data })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách giải trí cho người dùng (có cờ tương tác)
  static getForUser = CatchAsyncError(async (req: Request, res: Response) => {
    const userId = req.user?._id as string
    const type = (req.query.type as any) || undefined
    const data = await EntertainmentService.getForUser({ userId, type })
    res.status(200).json({ success: true, message: 'Lấy danh sách giải trí thành công', data })
  })

  // (USER) Lấy chi tiết giải trí cho người dùng
  static getForUserDetail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) {
      return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    }
    const { id } = req.params
    const data = await EntertainmentService.getForUserById({ userId, entertainmentId: id })
    res.status(200).json({ success: true, message: 'Lấy chi tiết giải trí thành công', data })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết giải trí theo ID
  static getById = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params
    const data = await EntertainmentService.getById(id)
    res.status(200).json({ success: true, message: 'Lấy chi tiết giải trí thành công', data })
  })

  // (ADMIN) Tạo mục giải trí mới
  static create = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const data = await EntertainmentService.create(req.body, userId)
    res.status(201).json({ success: true, message: 'Tạo mục giải trí thành công', data })
  })

  // (ADMIN) Cập nhật mục giải trí
  static update = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await EntertainmentService.update(id, req.body)
    res.status(200).json({ success: true, message: 'Cập nhật mục giải trí thành công', data })
  })

  // (ADMIN) Xóa mục giải trí
  static delete = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await EntertainmentService.delete(id)
    res.status(200).json({ success: true, message: 'Xóa mục giải trí thành công', data })
  })

  // (ADMIN) Bật/tắt yêu cầu VIP cho mục giải trí
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await EntertainmentService.toggleVipStatus(id)
    res.status(200).json({ success: true, message: `Đã ${data.isVipRequired ? 'bật' : 'tắt'} yêu cầu VIP thành công`, data })
  })

  // (ADMIN) Bật/tắt trạng thái hiển thị cho mục giải trí
  static toggleStatus = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await EntertainmentService.toggleStatus(id)
    res.status(200).json({ success: true, message: `Đã ${data.status ? 'hiển thị' : 'ẩn'} giải trí thành công`, data })
  })
}


