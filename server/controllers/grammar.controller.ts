import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { GrammarService } from "../services/grammar.service";
import ErrorHandler from "../utils/ErrorHandler";
import { UserInfo } from "../services/auth.service";
import { IQuizResult } from "../models/quizzResult.model";
import { StreakService } from "../services/streak.service";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";

export class GrammarController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về ngữ pháp
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await GrammarService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan ngữ pháp thành công',
      data: stats,
    })
  })

  // (ADMIN) Import dữ liệu ngữ pháp từ JSON
  static importGrammarJson = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { topics, skipErrors } = req.body;
      if (!Array.isArray(topics)) {
        return next(new ErrorHandler("Dữ liệu 'topics' phải là một mảng", 400));
      }

      const result = await GrammarService.importGrammarTopicsFromJson({
        topics,
        userId,
        skipErrors: Boolean(skipErrors),
      });

      const { errors } = result;
      const hasErrors = Array.isArray(errors) && errors.length > 0;
      const message = hasErrors
        ? Boolean(skipErrors)
          ? `Import hoàn tất nhưng có ${errors.length} lỗi. Đã bỏ qua các chủ đề lỗi.`
          : `Import thất bại do ${errors.length} lỗi.`
        : "Import ngữ pháp thành công";

      res.status(200).json({
        success: true,
        message,
        data: result,
      });
    }
  );

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách chủ đề ngữ pháp (có phân trang & tìm kiếm)
  static getAllGrammarTopics = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "orderIndex",
        sortOrder = "asc",
        isActive,
        isVipRequired,
        createdBy,
      } = req.query;

      const result = await GrammarService.getAllGrammarTopicsPaginated({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        isVipRequired: isVipRequired !== undefined ? isVipRequired === "true" : undefined,
        createdBy: createdBy as string,
      });

      res.status(200).json({
        success: true,
        message: "Lấy danh sách chủ đề ngữ pháp thành công",
        data: result.grammarTopics,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total || result.totalDocs || 0,
          pages: result.pages || result.totalPages || 0,
          hasNext: result.hasNext || result.hasNextPage || false,
          hasPrev: result.hasPrev || result.hasPrevPage || false,
          next: result.next || result.nextPage || null,
          prev: result.prev || result.prevPage || null,
        },
      });
    }
  );

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều chủ đề
  static updateManyGrammarTopicsStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Vui lòng cung cấp danh sách ID', 400))
    }
    const result = await GrammarService.updateManyGrammarTopicsStatus(ids, isActive)
    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái cho ${result.updatedCount} chủ đề`,
      data: result
    })
  })

  // (ADMIN) Xóa nhiều chủ đề ngữ pháp
  static deleteManyGrammarTopics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Vui lòng cung cấp danh sách ID', 400))
    }
    const result = await GrammarService.deleteManyGrammarTopics(ids)
    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} chủ đề ngữ pháp thành công`,
      data: result
    })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách chủ đề ngữ pháp cho người dùng
  static getAllTopicsByUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const topics = await GrammarService.getAllTopicsByUser(userId);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách chủ đề ngữ pháp thành công",
        data: topics,
      });
    }
  );

  // (USER) Lấy danh sách câu hỏi quiz của chủ đề (trang /quizz)
  static getGrammarQuizForUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) return next(new ErrorHandler("Thiếu ID chủ đề ngữ pháp", 400));

      const quizzes = await GrammarService.getQuizByGrammarTopicForUser(id);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách câu hỏi quiz ngữ pháp thành công",
        data: quizzes,
      });
    }
  );

  // (USER) Nộp bài kiểm tra ngữ pháp
  static doGrammarQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quizResults, studySession } = req.body;
    const user = req.user as UserInfo;
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession);

    const grammarProgress = await GrammarService.doGrammarQuiz(
      id,
      user._id,
      quizResults as IQuizResult[],
      studyTimeSeconds
    );
    await StreakService.update(user._id);

    res.status(200).json({
      success: true,
      message: "Làm bài kiểm tra ngữ pháp thành công",
      data: grammarProgress,
    });
  });

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề ngữ pháp theo ID
  static getGrammarTopicById = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const grammarTopic = await GrammarService.getGrammarTopicById(req.params.id);

      res.status(200).json({
        success: true,
        message: "Lấy chủ đề ngữ pháp thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Tạo chủ đề ngữ pháp mới
  static createGrammarTopic = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { title, description, level } = req.body;
      if (!title || !String(title).trim()) {
        return next(new ErrorHandler("Tiêu đề là bắt buộc", 400));
      }
      if (!level) {
        return next(new ErrorHandler("Trình độ là bắt buộc", 400));
      }

      const grammarTopic = await GrammarService.createGrammarTopic({
        title: String(title),
        description: description ? String(description) : undefined,
        level: level,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        message: "Tạo chủ đề ngữ pháp thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Cập nhật thông tin cơ bản chủ đề ngữ pháp
  static updateGrammarTopic = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { title, description, level } = req.body;
      if (title !== undefined && !String(title).trim()) {
        return next(new ErrorHandler("Tiêu đề không được để trống", 400));
      }

      const grammarTopic = await GrammarService.updateGrammarTopic(req.params.id, {
        title: title !== undefined ? String(title) : undefined,
        description: description !== undefined ? String(description) : undefined,
        level: level !== undefined ? level : undefined,
        updatedBy: userId,
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật chủ đề ngữ pháp thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Xóa một chủ đề ngữ pháp
  static deleteGrammarTopic = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const grammarTopic = await GrammarService.deleteGrammarTopic(req.params.id);

      res.status(200).json({
        success: true,
        message: "Xóa chủ đề ngữ pháp thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Cập nhật danh sách sections cho chủ đề
  static updateGrammarSections = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { sections } = req.body;
      if (!Array.isArray(sections)) {
        return next(new ErrorHandler("Danh sách section không hợp lệ", 400));
      }

      const grammarTopic = await GrammarService.updateGrammarSections(req.params.id, {
        sections,
        updatedBy: userId,
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật sections thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Cập nhật danh sách bài luyện tập cho chủ đề
  static updateGrammarPractice = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { practice } = req.body;
      if (!Array.isArray(practice)) {
        return next(new ErrorHandler("Danh sách bài luyện tập không hợp lệ", 400));
      }

      const grammarTopic = await GrammarService.updateGrammarPractice(req.params.id, {
        practice,
        updatedBy: userId,
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật practice thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Cập nhật danh sách quiz cho chủ đề
  static updateGrammarQuizzes = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { quizzes } = req.body;
      if (!Array.isArray(quizzes)) {
        return next(new ErrorHandler("Danh sách quiz không hợp lệ", 400));
      }

      const grammarTopic = await GrammarService.updateGrammarQuizzes(req.params.id, {
        quizzes,
        updatedBy: userId,
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật quiz thành công",
        data: grammarTopic,
      });
    }
  );

  // (ADMIN) Toggle trạng thái xuất bản
  static toggleGrammarTopicStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const topic = await GrammarService.toggleGrammarTopicStatus(req.params.id)
    res.status(200).json({
      success: true,
      message: `Đã ${topic.isActive ? 'xuất bản' : 'ẩn'} chủ đề ngữ pháp`,
      data: topic
    })
  })

  // (ADMIN) Toggle trạng thái VIP
  static toggleGrammarTopicVip = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const topic = await GrammarService.toggleGrammarTopicVip(req.params.id)
    res.status(200).json({
      success: true,
      message: `Đã ${topic.isVipRequired ? 'bật' : 'tắt'} yêu cầu VIP cho bài học này`,
      data: topic
    })
  })

  // (ADMIN) Đổi thứ tự bài học
  static swapGrammarTopicOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { direction } = req.body
    const result = await GrammarService.swapGrammarTopicOrder(req.params.id, direction)
    res.status(200).json({
      success: true,
      message: 'Đổi thứ tự bài học thành công',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê chi tiết chủ đề
  static getGrammarTopicStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await GrammarService.getGrammarTopicStats(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê chi tiết chủ đề thành công',
      data: stats
    })
  })

  // (ADMIN) Lấy thống kê người dùng
  static getUserStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await GrammarService.getUserStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê người dùng thành công',
      data: stats
    })
  })

  // (ADMIN) Lấy thống kê theo thời gian
  static getTimeSeriesStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await GrammarService.getTimeSeriesStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê theo thời gian thành công',
      data: stats
    })
  })

  // (ADMIN) Xuất dữ liệu Excel
  static exportGrammarData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const buf = await GrammarService.exportGrammarData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="grammar_export.xlsx"')
    res.status(200).send(buf)
  })
}
