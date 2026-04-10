import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import { AdminActivityService } from '../services/adminActivity.service'

export class AdminActivityController {
  static getActivities = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { page = 1, limit = 20, action, resourceType, adminId, search = '' } = req.query
    const data = await AdminActivityService.getActivities({
      page: Number(page),
      limit: Number(limit),
      action: action as string,
      resourceType: resourceType as string,
      adminId: adminId as string,
      search: String(search || '')
    })

    res.status(200).json({
      success: true,
      message: 'Lấy lịch sử hoạt động admin thành công',
      data: data.activities,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        pages: data.pages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      }
    })
  })
}

