import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { DocumentCategoryService } from "../services/documentCategory.service";
import ErrorHandler from "../utils/ErrorHandler";

export class DocumentCategoryController {
  // Tạo danh mục mới
  static createCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

    const { name } = req.body;
    if (!name) {
      return next(new ErrorHandler("Tên danh mục là bắt buộc", 400));
    }

    const category = await DocumentCategoryService.createCategory({
      name,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  });

  // Lấy tất cả danh mục
  static getAllCategories = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const categories = await DocumentCategoryService.getAllCategories();

    res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: categories,
    });
  });

  // Lấy chi tiết danh mục
  static getCategoryById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const category = await DocumentCategoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết danh mục thành công",
      data: category,
    });
  });

  // Cập nhật danh mục
  static updateCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;

    const category = await DocumentCategoryService.updateCategory(id, { name });

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  });

  // Xóa danh mục
  static deleteCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await DocumentCategoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  });
}
