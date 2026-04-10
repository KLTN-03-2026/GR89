import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { ReportService } from "../services/report.service";

export class ReportController {
  static getDashboardReport = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { startDate, endDate, category } = req.query;

    const data = await ReportService.getDashboardReport({
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      category: category ? String(category) as any : "all",
    });

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu báo cáo thành công",
      data,
    });
  });
}

