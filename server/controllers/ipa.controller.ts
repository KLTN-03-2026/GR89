import { NextFunction, Request, Response } from "express"
import { CatchAsyncError } from "../middleware/CatchAsyncError"
import { IpaService } from "../services/ipa.service"
import ErrorHandler from "../utils/ErrorHandler"
import fs from "fs"
import { IExample, IIpa } from "../models/ipa.model"
import { UserInfo } from "../services/auth.service"
import { calculateStudyTimeSeconds } from "../utils/studyTime.util"

export class IpaController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu IPA ra file Excel
  static exportIpaData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const buf = await IpaService.exportIpaData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="ipa_export.xlsx"')
    res.status(200).send(buf)
  })

  // (ADMIN) Import dữ liệu IPA từ JSON
  static importIpaJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ipas, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(ipas)) return next(new ErrorHandler('Dữ liệu ipas phải là mảng', 400))

    const result = await IpaService.importIpaFromJson({
      ipas,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu IPA hoàn tất',
      data: result
    })
  })

  // (ADMIN) Quản lý - Thao tác hàng loạt

  // (ADMIN) Lấy danh sách IPA (có phân trang & tìm kiếm)
  static getAllIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'sound',
      sortOrder = 'asc',
      soundType,
      createdBy,
      isActive
    } = req.query
    const result = await IpaService.getAllIPAPaginated({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      soundType: soundType as 'vowel' | 'consonant' | 'diphthong',
      createdBy: createdBy as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    })

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách IPA thành công',
      data: result.ipas,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total || result.totalDocs || 0,
        pages: result.pages || result.totalPages || 0,
        hasNext: result.hasNext || result.hasNextPage || false,
        hasPrev: result.hasPrev || result.hasPrevPage || false,
        next: result.next || result.nextPage || null,
        prev: result.prev || result.prevPage || null
      }
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều IPA
  static updateManyIpaStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400))
    }
    const result = await IpaService.updateManyIpaStatus(ids, isActive)
    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} IPA`,
      data: result,
    })
  })

  // (ADMIN) Xóa nhiều IPA
  static deleteManyIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400))
    }
    const result = await IpaService.deleteManyIpa(ids)
    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} IPA thành công`,
      data: result,
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy tất cả IPA cho người dùng
  static getIpaByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const ipa = await IpaService.getIpaByUser(String(userId))
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách IPA thành công',
      data: ipa,
    })
  })

  // (USER) Chấm điểm phát âm IPA bằng AI
  static assessPronunciationIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { referenceText, ipaId, studyTime } = req.body
    const userId = req.user?._id
    const audioFile = req.file as Express.Multer.File

    if (!referenceText) return next(new ErrorHandler('Vui lòng cung cấp văn bản mẫu', 400))
    if (!audioFile || !audioFile.buffer || audioFile.buffer.length === 0) return next(new ErrorHandler('Ghi âm không hợp lệ, vui lòng thử lại', 400))

    const audioBuffer = Buffer.from(audioFile.buffer)
    const pronunciationResult = await IpaService.assessPronunciationIpa(
      referenceText,
      audioBuffer,
      String(userId),
      ipaId,
      Number(studyTime) || 0
    )

    res.status(200).json({
      success: true,
      message: 'Chấm điểm phát âm IPA thành công',
      data: pronunciationResult,
    })
  })

  // (USER) Lưu điểm cao nhất cho bài học IPA
  static saveHighestScore = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInfo
    const { score, studySession } = req.body
    const { lessonId } = req.params
    if (!user || !user._id || !lessonId || score === undefined) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return next(new ErrorHandler('Điểm số phải là số từ 0 đến 100', 400))
    }
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession)
    const result = await IpaService.saveHighestScore(user._id, lessonId, score, studyTimeSeconds)
    res.status(200).json({
      success: true,
      message: 'Đã lưu tiến độ học tập thành công',
      data: result
    })
  })

  // (USER) Lấy điểm cao nhất cho bài học IPA
  static getHighestScore = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInfo
    const { lessonId } = req.params
    if (!user || !user._id || !lessonId) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const result = await IpaService.getHighestScore(user._id, lessonId)
    res.status(200).json({
      success: true,
      message: 'Lấy điểm cao nhất thành công',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về IPA
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await IpaService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan IPA thành công',
      data: stats,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy thông tin chi tiết IPA theo ID
  static getIpaById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const ipa = await IpaService.getIpaById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết IPA thành công',
      data: ipa,
    })
  })

  // (ADMIN) Tạo IPA mới
  static createIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { sound, soundType, image, video, description } = req.body
    if (!sound || !soundType || !image || !description) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const newIpa = await IpaService.createIpa({ sound, soundType, image, video, description, createdBy: req.user?._id as string } as unknown as IIpa)
    res.status(201).json({
      success: true,
      message: 'Tạo IPA thành công',
      data: newIpa,
    })
  })

  // (ADMIN) Cập nhật IPA
  static updateIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { sound, soundType, image, video, description, examples } = req.body
    if (!sound || !soundType || !image || !description || !examples) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const updatedIpa = await IpaService.updateIpa(id, { sound, soundType, image, video, description, examples, updatedBy: req.user?._id as string } as unknown as IIpa)
    res.status(200).json({
      success: true,
      message: 'Cập nhật IPA thành công',
      data: updatedIpa,
    })
  })

  // (ADMIN) Xóa một IPA
  static deleteIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const deletedIpa = await IpaService.deleteIpa(id)
    res.status(200).json({
      success: true,
      message: 'Xóa IPA thành công',
      data: deletedIpa,
    })
  })

  // (ADMIN) Bật/tắt trạng thái xuất bản IPA
  static updateIpaStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const ipa = await IpaService.updateIpaStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${ipa.isActive ? 'xuất bản' : 'ẩn'} IPA thành công`,
      data: ipa,
    })
  })

  // (ADMIN) Bật/tắt yêu cầu VIP cho IPA
  static toggleVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const ipa = await IpaService.toggleVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${ipa.isVipRequired ? 'bật' : 'tắt'} VIP cho bài học này`,
      data: ipa,
    })
  })

  /*============================ QUẢN TRỊ - VÍ DỤ (EXAMPLES) ============================*/

  // (ADMIN) Thêm ví dụ cho IPA
  static addExampleIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { example } = req.body
    const ipa = await IpaService.addExampleIpa(id, example as IExample)
    res.status(201).json({
      success: true,
      message: 'Thêm ví dụ IPA thành công',
      data: ipa,
    })
  })

  // (ADMIN) Cập nhật ví dụ cho IPA
  static updateExampleIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { exampleId, example } = req.body
    const ipa = await IpaService.updateExampleIpa(id, exampleId, example as IExample)
    res.status(200).json({
      success: true,
      message: 'Cập nhật ví dụ IPA thành công',
      data: ipa,
    })
  })

  // (ADMIN) Xóa ví dụ khỏi IPA
  static deleteExampleIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { exampleId } = req.body
    const ipa = await IpaService.deleteExampleIpa(id, exampleId)
    res.status(200).json({
      success: true,
      message: 'Xóa ví dụ IPA thành công',
      data: ipa,
    })
  })

  // (ADMIN) Xóa nhiều ví dụ khỏi IPA
  static deleteManyExamplesIpa = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { exampleIds } = req.body
    if (!exampleIds || !Array.isArray(exampleIds) || exampleIds.length === 0) {
      return next(new ErrorHandler('Danh sách ID ví dụ không được để trống', 400))
    }
    const ipa = await IpaService.deleteManyExamplesIpa(id, exampleIds)
    res.status(200).json({
      success: true,
      message: `Đã xóa ${exampleIds.length} ví dụ IPA thành công`,
      data: ipa,
    })
  })

  // (ADMIN) Thay đổi thứ tự IPA
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { direction } = req.body
    if (!id || !direction) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
    }
    const result = await IpaService.swapOrderIndex(id, direction)
    res.status(200).json({
      success: true,
      message: 'Thay đổi thứ tự IPA thành công',
      data: result,
    })
  })
}