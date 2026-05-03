import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IGlobalDocument extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  content: string; // Rich text content
  owner: mongoose.Types.ObjectId;
}

export interface IGlobalDocumentPaginateResult {
  documents: IGlobalDocument[];
  total: number;
  totalDocs?: number;
  limit: number;
  page?: number;
  pages: number;
  totalPages?: number;
  hasNext: boolean;
  hasNextPage?: boolean;
  hasPrev: boolean;
  hasPrevPage?: boolean;
  next?: number | null;
  nextPage?: number | null;
  prev?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
}

export interface IGlobalDocumentModel extends mongoose.Model<IGlobalDocument> {
  paginate(query?: any, options?: any): Promise<IGlobalDocumentPaginateResult>;
}

const globalDocumentSchema = new Schema<IGlobalDocument>(
  {
    name: {
      type: String,
      required: [true, "Tên tài liệu là bắt buộc"],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "DocumentCategory",
      required: [true, "Danh mục tài liệu là bắt buộc"],
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người sở hữu tài liệu là bắt buộc"],
    },
  },
  {
    timestamps: true,
  }
);

globalDocumentSchema.plugin(mongoosePaginate);

export const GlobalDocument = mongoose.model<IGlobalDocument, IGlobalDocumentModel>(
  "GlobalDocument",
  globalDocumentSchema
);
