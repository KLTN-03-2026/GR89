import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'
import { UserScoreService } from '../services/userScore.service'

export class UserScoreController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về điểm số của tất cả người dùng
  static getStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await UserScoreService.getStats();

    res.status(200).json({
      success: true,
      message: "Lấy thống kê thành công",
      data: stats,
    });
  });

  // (ADMIN) Lấy phân tích kỹ năng trung bình của tất cả người dùng
  static getSkillAnalysis = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const skillAnalysis = await UserScoreService.getSkillAnalysis();

      res.status(200).json({
        success: true,
        message: "Lấy phân tích kỹ năng thành công",
        data: skillAnalysis,
      });
    }
  );

  // (ADMIN) Đồng bộ và cập nhật điểm số cho một người dùng
  static createOrUpdateUserScore = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.params;
      const scoreData = req.body;

      if (!userId) return next(new ErrorHandler("Vui lòng cung cấp ID người dùng", 400));

      const userScore = await UserScoreService.createOrUpdateUserScore(userId, scoreData);

      res.status(200).json({
        success: true,
        message: "Cập nhật điểm số thành công",
        data: userScore,
      });
    }
  );

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách điểm số người dùng (có phân trang & tìm kiếm)
  static getAllUserScores = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "totalPoints",
        sortOrder = "desc",
        isActive,
      } = req.query;

      const result = await UserScoreService.getAllUserScoresPaginated({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Lấy danh sách điểm số thành công",
        data: result.users,
        pagination: {
          total: result.totalDocs,
          limit: result.limit,
          page: result.page,
          pages: result.pages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
          next: result.next,
          prev: result.prev,
        },
      });
    }
  );

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách người dùng có điểm số cao nhất (Bảng xếp hạng)
  static getTopUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 5 } = req.query;
    const topUsers = await UserScoreService.getTopUsers(Number(limit));
    res.status(200).json({
      success: true,
      message: "Lấy top users thành công",
      data: topUsers,
    });
  });

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết điểm số của một người dùng theo ID
  static getUserScoreById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.params;
      if (!userId) return next(new ErrorHandler("Vui lòng cung cấp ID người dùng", 400));

      const data = await UserScoreService.getUserScoreById(userId);

      res.status(200).json({
        success: true,
        message: "Lấy điểm số học viên thành công",
        data,
      });
    }
  );
}
