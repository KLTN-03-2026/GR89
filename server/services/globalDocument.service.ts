import { GlobalDocument, IGlobalDocument, IGlobalDocumentPaginateResult } from "../models/globalDocument.model";
import ErrorHandler from "../utils/ErrorHandler";

export interface ICreateGlobalDocumentData {
  name: string;
  category: string;
  content?: string;
  owner: string;
}

export interface IUpdateGlobalDocumentData {
  name?: string;
  category?: string;
  content?: string;
}

export interface IGlobalDocumentOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
}

export class GlobalDocumentService {
  // Tạo tài liệu mới
  static async createDocument(data: ICreateGlobalDocumentData): Promise<IGlobalDocument> {
    const document = await GlobalDocument.create(data);
    return document;
  }

  // Lấy danh sách tài liệu (phân trang & tìm kiếm)
  static async getAllDocumentsPaginated(options: IGlobalDocumentOptions): Promise<IGlobalDocumentPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
    } = options;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const paginateOptions = {
      page,
      limit,
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      populate: [
        { path: "owner", select: "name email avatar" },
        { path: "category", select: "name" }
      ],
      customLabels: {
        docs: "documents",
        totalDocs: "total",
      },
    };

    const result = await GlobalDocument.paginate(query, paginateOptions);
    return result as unknown as IGlobalDocumentPaginateResult;
  }

  // Lấy chi tiết tài liệu
  static async getDocumentById(id: string): Promise<IGlobalDocument> {
    const document = await GlobalDocument.findById(id)
      .populate("owner", "name email avatar")
      .populate("category", "name");
    if (!document) {
      throw new ErrorHandler("Không tìm thấy tài liệu", 404);
    }
    return document;
  }

  // Cập nhật tài liệu
  static async updateDocument(_id: string, data: IUpdateGlobalDocumentData): Promise<IGlobalDocument> {
    const document = await GlobalDocument.findByIdAndUpdate(_id, data, {
      new: true,
      runValidators: true,
    })
      .populate("owner", "name email avatar")
      .populate("category", "name");

    if (!document) {
      throw new ErrorHandler("Không tìm thấy tài liệu", 404);
    }
    return document;
  }

  // Xóa tài liệu
  static async deleteDocument(_id: string): Promise<void> {
    const document = await GlobalDocument.findByIdAndDelete(_id);
    if (!document) {
      throw new ErrorHandler("Không tìm thấy tài liệu", 404);
    }
  }

  // Xóa nhiều tài liệu
  static async deleteManyDocuments(_ids: string[]): Promise<void> {
    await GlobalDocument.deleteMany({ _id: { $in: _ids } });
  }
}
