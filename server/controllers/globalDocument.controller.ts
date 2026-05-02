import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { GlobalDocumentService } from "../services/globalDocument.service";
import ErrorHandler from "../utils/ErrorHandler";
const htmlToDocx = require("html-to-docx");

export class GlobalDocumentController {
  // Tạo tài liệu mới
  static createDocument = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

    const { name, category, content } = req.body;
    if (!name || !category) {
      return next(new ErrorHandler("Tên và danh mục là bắt buộc", 400));
    }

    const document = await GlobalDocumentService.createDocument({
      name,
      category,
      content,
      owner: userId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo tài liệu thành công",
      data: document,
    });
  });

  // Lấy danh sách tài liệu
  static getAllDocuments = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
    } = req.query;

    const result = await GlobalDocumentService.getAllDocumentsPaginated({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      category: category as string,
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách tài liệu thành công",
      data: result.documents,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        next: result.next,
        prev: result.prev,
      },
    });
  });

  // Lấy chi tiết tài liệu
  static getDocumentById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await GlobalDocumentService.getDocumentById(id);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết tài liệu thành công",
      data: document,
    });
  });

  // Cập nhật tài liệu
  static updateDocument = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, category, content } = req.body;

    const document = await GlobalDocumentService.updateDocument(id, {
      name,
      category,
      content,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật tài liệu thành công",
      data: document,
    });
  });

  // Xóa tài liệu
  static deleteDocument = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await GlobalDocumentService.deleteDocument(id);

    res.status(200).json({
      success: true,
      message: "Xóa tài liệu thành công",
    });
  });

  // Xóa nhiều tài liệu
  static deleteManyDocuments = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler("Danh sách ID không hợp lệ", 400));
    }

    await GlobalDocumentService.deleteManyDocuments(ids);

    res.status(200).json({
      success: true,
      message: `Đã xóa ${ids.length} tài liệu`,
    });
  });

  // Xuất file docx
  static downloadDocx = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await GlobalDocumentService.getDocumentById(id);

    if (!document) {
      return next(new ErrorHandler("Không tìm thấy tài liệu", 404));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
        <head><meta charset="UTF-8"></head>
        <body>${document.content}</body>
      </html>
    `;

    const docxBuffer = await htmlToDocx(htmlContent, null, {
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(document.name)}.docx`);
    res.send(docxBuffer);
  });
}
