import { DocumentCategory, IDocumentCategory } from "../models/documentCategory.model";
import { GlobalDocument } from "../models/globalDocument.model";
import ErrorHandler from "../utils/ErrorHandler";

export interface ICreateCategoryData {
  name: string;
  createdBy: string;
}

export interface IUpdateCategoryData {
  name?: string;
}

export class DocumentCategoryService {
  // Tạo danh mục mới
  static async createCategory(data: ICreateCategoryData): Promise<IDocumentCategory> {
    const existing = await DocumentCategory.findOne({ name: data.name });
    if (existing) {
      throw new ErrorHandler("Tên danh mục đã tồn tại", 400);
    }
    const category = await DocumentCategory.create(data);
    return category;
  }

  // Lấy tất cả danh mục
  static async getAllCategories(): Promise<IDocumentCategory[]> {
    const categories = await DocumentCategory.find().sort({ createdAt: -1 });
    return categories;
  }

  // Lấy chi tiết danh mục
  static async getCategoryById(_id: string): Promise<IDocumentCategory> {
    const category = await DocumentCategory.findById(_id);
    if (!category) {
      throw new ErrorHandler("Không tìm thấy danh mục", 404);
    }
    return category;
  }

  // Cập nhật danh mục
  static async updateCategory(_id: string, data: IUpdateCategoryData): Promise<IDocumentCategory> {
    if (data.name) {
      const existing = await DocumentCategory.findOne({ name: data.name, _id: { $ne: _id } });
      if (existing) {
        throw new ErrorHandler("Tên danh mục đã tồn tại", 400);
      }
    }

    const category = await DocumentCategory.findByIdAndUpdate(_id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ErrorHandler("Không tìm thấy danh mục", 404);
    }
    return category;
  }

  // Xóa danh mục
  static async deleteCategory(_id: string): Promise<void> {
    // Kiểm tra xem có tài liệu nào đang sử dụng danh mục này không
    const documentCount = await GlobalDocument.countDocuments({ category: _id });
    if (documentCount > 0) {
      throw new ErrorHandler("Không thể xóa danh mục đang có tài liệu", 400);
    }

    const category = await DocumentCategory.findByIdAndDelete(_id);
    if (!category) {
      throw new ErrorHandler("Không tìm thấy danh mục", 404);
    }
  }
}
