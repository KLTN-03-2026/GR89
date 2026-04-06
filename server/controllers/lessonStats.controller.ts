import { NextFunction, Request, Response } from "express"
import { CatchAsyncError } from "../middleware/CatchAsyncError"
import { LessonStatsService } from "../services/lessonStats.service"
import ErrorHandler from "../utils/ErrorHandler"

export class LessonStatsController {
  // (USER) Lấy tổng quan thống kê các kỹ năng của người dùng
  static getUserLessonStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ErrorHandler("Không tìm thấy người dùng", 401));
    }
    const userLessonStats = await LessonStatsService.getOverviewStats(user._id);
    res.status(200).json({
      success: true,
      message: "Lấy thống kê bài học thành công",
      data: userLessonStats,
    });
  });
}