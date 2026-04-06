import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import { AdminDashboardService } from '../services/adminDashboard.service'

export class AdminDashboardController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy tổng quan thống kê hệ thống cho Dashboard
  static getOverview = CatchAsyncError(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await AdminDashboardService.getOverview();
    res.status(200).json({
      success: true,
      message: "Lấy tổng quan dashboard thành công",
      data,
    });
  });
}

