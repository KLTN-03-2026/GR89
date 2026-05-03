import { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middleware/CatchAsyncError';
import { DailySuggestionService } from '../services/dailySuggestion.service';
import ErrorHandler from '../utils/ErrorHandler';

export class DailySuggestionController {
  static getTodaySuggestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;

    if (!userId) {
      return next(new ErrorHandler('Vui lòng đăng nhập', 401));
    }

    const suggestion = await DailySuggestionService.getDailySuggestion(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy gợi ý học tập hôm nay thành công',
      data: suggestion
    });
  });
}
