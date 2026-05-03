import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { CenterClassService } from "../services/centerClass.service";
import ErrorHandler from "../utils/ErrorHandler";

export class CenterClassController {
  
  /* ============================ QUẢN LÝ LỚP HỌC ============================ */

  // Tạo lớp học mới
  static createClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const newClass = await CenterClassService.createClass(data);
    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: newClass
    });
  });

  // Lấy danh sách lớp học (phân trang & tìm kiếm)
  static getAllClasses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, search, sortBy, sortOrder, category, status } = req.query;
    const result = await CenterClassService.getAllClassesPaginated({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      category: category as string,
      status: status as string,
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách lớp học thành công",
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  });

  // Lấy chi tiết lớp học
  static getClassById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const centerClass = await CenterClassService.getClassById(id);
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết lớp học thành công",
      data: centerClass
    });
  });

  // Cập nhật lớp học
  static updateClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data = req.body;
    const updatedClass = await CenterClassService.updateClass(id, data);
    res.status(200).json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: updatedClass
    });
  });

  // Xóa lớp học
  static deleteClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await CenterClassService.deleteClass(id);
    res.status(200).json({
      success: true,
      message: "Xóa lớp học thành công"
    });
  });

  /* ============================ QUẢN LÝ HỌC SINH ============================ */

  // Thêm học sinh vào lớp
  static addStudent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { userId, joinDate } = req.body;
    if (!userId) return next(new ErrorHandler("ID người dùng là bắt buộc", 400));
    
    const updatedClass = await CenterClassService.addStudentToClass(id, userId, joinDate);
    res.status(200).json({
      success: true,
      message: "Thêm học sinh vào lớp thành công",
      data: updatedClass
    });
  });

  // Xóa học sinh khỏi lớp
  static removeStudent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id, userId } = req.params;
    const updatedClass = await CenterClassService.removeStudentFromClass(id, userId);
    res.status(200).json({
      success: true,
      message: "Xóa học sinh khỏi lớp thành công",
      data: updatedClass
    });
  });

  /* ============================ QUẢN LÝ BÀI TẬP ============================ */

  // Giao bài tập mới (Admin/Teacher)
  static createHomework = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { centerClassId, title, description, deadline } = req.body;
    if (!centerClassId || !title || !deadline) {
      return next(new ErrorHandler("Vui lòng cung cấp đầy đủ thông tin bài tập", 400));
    }

    const homework = await CenterClassService.createHomework({
      centerClassId,
      title,
      description,
      deadline
    });

    res.status(201).json({
      success: true,
      message: "Giao bài tập thành công",
      data: homework
    });
  });

  // Học sinh nộp bài
  static submitHomework = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id: homeworkId } = req.params;
    const userId = req.user?._id as string;
    const { content } = req.body;

    if (!content) return next(new ErrorHandler("Nội dung bài làm không được để trống", 400));

    const homework = await CenterClassService.submitHomework(homeworkId, userId, content);
    res.status(200).json({
      success: true,
      message: "Nộp bài tập thành công",
      data: homework
    });
  });

  // Giáo viên chấm bài
  static gradeHomework = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id: homeworkId } = req.params;
    const { userId, feedback } = req.body;

    if (!userId || !feedback) {
      return next(new ErrorHandler("Vui lòng cung cấp ID học sinh và nội dung nhận xét", 400));
    }

    const homework = await CenterClassService.gradeHomework(homeworkId, userId, feedback);
    res.status(200).json({
      success: true,
      message: "Chấm bài thành công",
      data: homework
    });
  });

  // Lấy chi tiết bài tập (bao gồm danh sách nộp bài)
  static getHomeworkById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const homework = await CenterClassService.getHomeworkById(id);
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết bài tập thành công",
      data: homework
    });
  });

  // Xóa bài tập
  static deleteHomework = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await CenterClassService.deleteHomework(id);
    res.status(200).json({
      success: true,
      message: "Xóa bài tập thành công"
    });
  });
}
