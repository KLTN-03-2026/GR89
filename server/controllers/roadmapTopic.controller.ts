import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { RoadmapTopicService } from "../services/roadmapTopic.service";

export class RoadmapTopicController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy danh sách bài học theo loại (chưa sử dụng trong roadmap)
  static getLessonsByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.query as { type?: string };

    if (!type) {
      return next(new ErrorHandler("Vui lòng cung cấp loại bài học", 400));
    }

    let result: any[] = [];
    let message = "";

    switch (type) {
      case 'ipa':
        result = await RoadmapTopicService.getIpaLessons();
        message = "Lấy danh sách bài học IPA thành công";
        break;
      case 'grammar':
        result = await RoadmapTopicService.getGrammarLessons();
        message = "Lấy danh sách bài học Ngữ pháp thành công";
        break;
      case 'vocabulary':
        result = await RoadmapTopicService.getVocabularyLessons();
        message = "Lấy danh sách bài học Từ vựng thành công";
        break;
      case 'listening':
        result = await RoadmapTopicService.getListeningLessons();
        message = "Lấy danh sách bài học Nghe thành công";
        break;
      case 'speaking':
        result = await RoadmapTopicService.getSpeakingLessons();
        message = "Lấy danh sách bài học Nói thành công";
        break;
      case 'reading':
        result = await RoadmapTopicService.getReadingLessons();
        message = "Lấy danh sách bài học Đọc thành công";
        break;
      case 'writing':
        result = await RoadmapTopicService.getWritingLessons();
        message = "Lấy danh sách bài học Viết thành công";
        break;
      case 'review':
        result = [];
        message = "Review không có danh sách bài học nguồn";
        break;
      default:
        return next(new ErrorHandler("Loại bài học không hợp lệ", 400));
    }

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách tất cả chủ đề roadmap
  static getAllTopics = CatchAsyncError(async (_req: Request, res: Response) => {
    const topics = await RoadmapTopicService.getAllTopics();

    res.status(200).json({
      success: true,
      message: "Lấy danh sách chủ đề roadmap thành công",
      data: topics,
    });
  });

  // (ADMIN) Cập nhật thứ tự các chủ đề roadmap
  static reorderTopics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const topics = req.body?.topics;
    const updatedTopics = await RoadmapTopicService.reorderTopics(topics, userId);

    res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự chủ đề roadmap thành công",
      data: updatedTopics,
    });
  });

  // (ADMIN) Cập nhật thứ tự các bài học trong một chủ đề
  static reorderLessons = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const { lessons } = req.body as { lessons?: { lessonId: string; orderIndex: number }[] };
    if (!lessons || !Array.isArray(lessons)) {
      return next(new ErrorHandler("Vui lòng cung cấp danh sách bài học cần sắp xếp", 400));
    }

    const topic = await RoadmapTopicService.reorderLessons(req.params.id, lessons, userId);

    res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự bài học thành công",
      data: topic,
    });
  });

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy lộ trình học tập của người dùng
  static getUserRoadmaps = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const roadmaps = await RoadmapTopicService.getUserRoadmaps(userId);

    res.status(200).json({
      success: true,
      message: "Lấy lộ trình học tập thành công",
      data: roadmaps,
    });
  });

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề roadmap theo ID
  static getTopicById = CatchAsyncError(async (req: Request, res: Response) => {
    const topic = await RoadmapTopicService.getTopicById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết chủ đề roadmap thành công",
      data: topic,
    });
  });

  // (ADMIN) Lấy danh sách bài học của một chủ đề
  static getTopicLessons = CatchAsyncError(async (req: Request, res: Response) => {
    const lessons = await RoadmapTopicService.getTopicLessons(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bài học theo chủ đề thành công",
      data: lessons,
    });
  });

  // (ADMIN) Tạo chủ đề roadmap mới
  static createTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const { title, description, icon } = req.body;
    const topic = await RoadmapTopicService.createTopic({
      title,
      description,
      icon,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo chủ đề roadmap thành công",
      data: topic,
    });
  });

  // (ADMIN) Cập nhật thông tin chủ đề roadmap
  static updateTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const { title, description, icon, isActive, orderIndex } = req.body;
    const topic = await RoadmapTopicService.updateTopic(req.params.id, {
      title,
      description,
      icon,
      isActive,
      orderIndex,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật chủ đề roadmap thành công",
      data: topic,
    });
  });

  // (ADMIN) Xóa chủ đề roadmap
  static deleteTopic = CatchAsyncError(async (req: Request, res: Response) => {
    const topic = await RoadmapTopicService.deleteTopic(req.params.id);

    res.status(200).json({
      success: true,
      message: "Xóa chủ đề roadmap thành công",
      data: topic,
    });
  });

  // (ADMIN) Thêm bài học vào chủ đề roadmap
  static addLessonToTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const { type, lessonId } = req.body as { type?: string; lessonId?: string };
    if (!type || !lessonId) {
      return next(new ErrorHandler("Vui lòng cung cấp type và lessonId", 400));
    }

    const topic = await RoadmapTopicService.addLessonToTopic(req.params.id, {
      type: type as any,
      lessonId,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: "Thêm bài học vào chủ đề thành công",
      data: topic,
    });
  });

  // (ADMIN) Xóa bài học khỏi chủ đề roadmap
  static removeLessonFromTopic = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) {
      return next(new ErrorHandler("Vui lòng đăng nhập", 401));
    }

    const { topicId, lessonId } = req.params as { topicId: string; lessonId: string };
    const topic = await RoadmapTopicService.removeLessonFromTopic(topicId, {
      lessonId,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: "Xóa bài học khỏi chủ đề thành công",
      data: topic,
    });
  });
}

