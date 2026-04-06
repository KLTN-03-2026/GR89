import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { VocabularyService } from "../services/vocabulary.service";
import ErrorHandler from "../utils/ErrorHandler";
import { UserInfo } from "../services/auth.service";
import { IQuiz } from "../models/quiz.model";
import { StreakService } from "../services/streak.service";
import { calculateStudyTimeSeconds } from "../utils/studyTime.util";

export class VocabularyController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất dữ liệu từ vựng ra file Excel
  static exportVocabularyData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const buf = await VocabularyService.exportVocabularyData()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="vocabulary_export.xlsx"')
    res.status(200).send(buf)
  })

  // (ADMIN) Import dữ liệu từ vựng từ JSON
  static importVocabularyJson = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { topics, skipErrors } = req.body
    const userId = req.user?._id

    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    if (!Array.isArray(topics)) return next(new ErrorHandler('Dữ liệu topics phải là mảng', 400))

    const result = await VocabularyService.importVocabularyTopicsFromJson({
      topics,
      userId: String(userId),
      skipErrors: !!skipErrors
    })

    res.status(200).json({
      success: true,
      message: 'Import dữ liệu từ vựng hoàn tất',
      data: result
    })
  })

  // (ADMIN) Lấy thống kê tổng quan về từ vựng
  static getOverviewStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await VocabularyService.getOverviewStats()
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan từ vựng thành công',
      data: stats,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách chủ đề từ vựng (có phân trang & tìm kiếm)
  static getAllTopics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      isActive,
      createdBy
    } = req.query
    const result = await VocabularyService.getAllTopicsPaginated({
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
      message: 'Lấy danh sách chủ đề từ vựng thành công',
      data: result.topics,
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

  // (ADMIN) Xóa nhiều chủ đề từ vựng
  static deleteManyVocabularyTopics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body as { ids: string[] }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Vui lòng cung cấp danh sách ID chủ đề từ vựng', 400))
    }
    const result = await VocabularyService.deleteManyVocabularyTopics(ids)
    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} chủ đề từ vựng thành công`,
      data: result
    })
  })

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều chủ đề
  static updateManyVocabularyTopicsStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids, isActive } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Danh sách ID không được để trống', 400));
    }
    if (typeof isActive !== 'boolean') {
      return next(new ErrorHandler('isActive phải là boolean', 400));
    }
    const result = await VocabularyService.updateManyVocabularyTopicsStatus(ids, isActive);
    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? 'xuất bản' : 'ẩn'} ${result.updatedCount} chủ đề từ vựng`,
      data: result,
    });
  });

  // (ADMIN) Xóa nhiều từ vựng
  static deleteManyVocabularies = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body as { ids: string[] }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler('Vui lòng cung cấp danh sách ID từ vựng', 400))
    }
    const result = await VocabularyService.deleteManyVocabularies(ids)
    res.status(200).json({ success: true, message: 'Xóa nhiều từ vựng thành công', data: result })
  })

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách chủ đề cho người dùng
  static getVocabularyListByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập người dùng', 404));

    const topics = await VocabularyService.getVocabularyListByUser(userId);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách chủ đề thành công',
      data: topics,
    });
  });

  // (USER) Lấy danh sách câu hỏi quiz của chủ đề
  static getQuizByVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler('Vui lòng chọn chủ đề từ vựng', 400));
    const quizzes = await VocabularyService.getQuizByVocabulary(id);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách câu hỏi quiz thành công',
      data: quizzes,
    });
  })

  // (USER) Nộp bài kiểm tra từ vựng
  static doQuizVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quizResults, studySession } = req.body;
    const user = req.user as UserInfo;
    const studyTimeSeconds = calculateStudyTimeSeconds(studySession);

    const vocabularyProgress = await VocabularyService.doQuizVocabulary(id, user._id, quizResults, studyTimeSeconds);
    await StreakService.update(user._id)

    res.status(200).json({
      success: true,
      message: 'Làm bài kiểm tra từ vựng thành công',
      data: vocabularyProgress
    });
  })

  // (USER) Lấy kết quả quiz của chủ đề
  static getVocabularyResult = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user as UserInfo;
    const vocabularyResult = await VocabularyService.getVocabularyResult(id, user._id);
    res.status(200).json({
      success: true,
      message: 'Lấy kết quả quiz từ vựng thành công',
      data: vocabularyResult
    });
  })

  // (USER) Lấy tổng quan học từ vựng (Dashboard)
  static getVocabularyOverview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string
    if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const data = await VocabularyService.getVocabularyOverview(userId)
    res.status(200).json({ success: true, data })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề và danh sách từ vựng
  static getAllVocabularyByTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID chủ đề', 400));
    const vocabulary = await VocabularyService.getAllVocabularyByTopic(id);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết chủ đề thành công',
      data: vocabulary,
    });
  });

  // (ADMIN) Tạo chủ đề từ vựng mới
  static createTopicVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { name, image, level } = req.body;
    if (!name || !image || !level) return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    const topic = await VocabularyService.createTopicVocabulary({ name, image, level, createdBy: req.user?._id as string });
    res.status(201).json({
      success: true,
      message: 'Tạo chủ đề từ vựng thành công',
      data: topic,
    });
  });

  // (ADMIN) Cập nhật chủ đề từ vựng
  static updateTopicVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, image, level } = req.body;
    if (!id || !name || !image || !level) return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    const user = req.user as UserInfo;
    const topic = await VocabularyService.updateTopicVocabulary(id, { name, image, level, createdBy: user._id as string });
    res.status(200).json({
      success: true,
      message: 'Cập nhật chủ đề từ vựng thành công',
      data: topic,
    });
  });

  // (ADMIN) Xóa chủ đề từ vựng
  static deleteTopicVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID chủ đề', 400));
    const topic = await VocabularyService.deleteTopicVocabulary(id);
    res.status(200).json({
      success: true,
      message: 'Xóa chủ đề từ vựng thành công',
      data: topic,
    });
  });

  // (ADMIN) Thay đổi thứ tự chủ đề (Lên/Xuống)
  static swapOrderIndex = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { direction } = req.body;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID chủ đề', 400));
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return next(new ErrorHandler('Direction phải là "up" hoặc "down"', 400));
    }
    const result = await VocabularyService.swapOrderIndex(id, direction);
    res.status(200).json({
      success: true,
      message: `Đã di chuyển chủ đề ${direction === 'up' ? 'lên' : 'xuống'} thành công`,
      data: result,
    });
  });

  // (ADMIN) Bật/tắt trạng thái xuất bản chủ đề
  static updateTopicVocabularyStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID chủ đề', 400));
    const topic = await VocabularyService.updateTopicVocabularyStatus(id);
    res.status(200).json({
      success: true,
      message: `Đã ${topic.isActive ? 'xuất bản' : 'ẩn'} chủ đề thành công`,
      data: topic,
    });
  });

  // (ADMIN) Bật/tắt yêu cầu VIP cho chủ đề
  static toggleTopicVipStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (!id) return next(new ErrorHandler('Vui lòng cung cấp ID chủ đề', 400))
    const topic = await VocabularyService.toggleTopicVipStatus(id)
    res.status(200).json({
      success: true,
      message: `Đã ${topic.isVipRequired ? 'bật' : 'tắt'} VIP cho chủ đề từ vựng này`,
      data: topic,
    })
  })

  // (ADMIN) Tạo từ vựng mới
  static createVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { word, transcription, partOfSpeech, definition, vietnameseMeaning, example, image, vocabularyTopicId } = req.body;
    if (!word || !transcription || !partOfSpeech || !definition || !vietnameseMeaning || !example || !image || !vocabularyTopicId) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    }
    const user = req.user as UserInfo;
    const vocabulary = await VocabularyService.createVocabulary({ word, transcription, partOfSpeech, definition, vietnameseMeaning, example, image, vocabularyTopicId, createdBy: user._id as string });
    res.status(201).json({
      success: true,
      message: 'Tạo từ vựng thành công',
      data: vocabulary
    })
  });

  // (ADMIN) Cập nhật từ vựng
  static updateVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { word, transcription, partOfSpeech, definition, vietnameseMeaning, example, image, vocabularyTopicId } = req.body;
    if (!id || !word || !transcription || !partOfSpeech || !definition || !vietnameseMeaning || !example || !image || !vocabularyTopicId) {
      return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400));
    }
    const user = req.user as UserInfo;
    const vocabulary = await VocabularyService.updateVocabulary(id, { word, transcription, partOfSpeech, definition, vietnameseMeaning, example, image, vocabularyTopicId, updatedBy: user._id as string } as any);
    res.status(200).json({
      success: true,
      message: 'Cập nhật từ vựng thành công',
      data: vocabulary
    })
  });

  // (ADMIN) Xóa từ vựng
  static deleteVocabulary = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler('Vui lòng chọn từ vựng cần xóa', 400));
    const vocabulary = await VocabularyService.deleteVocabulary(id);
    res.status(200).json({
      success: true,
      message: 'Xóa từ vựng thành công',
      data: vocabulary,
    });
  })

  // (ADMIN) Lấy tất cả quiz của chủ đề
  static getAllQuizByTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const quizzes = await VocabularyService.getAllQuizByTopic(id);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách quiz thành công',
      data: quizzes,
    });
  });

  // (ADMIN) Tạo quiz mới cho chủ đề
  static createQuizByTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { question, options, answer, explanation, type } = req.body;
    const quiz = await VocabularyService.createQuizByTopic(id, { question, options, answer, explanation, type } as IQuiz);
    res.status(200).json({
      success: true,
      message: 'Tạo quiz thành công',
      data: quiz,
    });
  });

  // (ADMIN) Xóa quiz của chủ đề
  static deleteQuizByTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id, quizId } = req.params;
    const quiz = await VocabularyService.deleteQuizByTopic(id, quizId);
    res.status(200).json({
      success: true,
      message: 'Xóa quiz thành công',
      data: quiz,
    });
  });
}