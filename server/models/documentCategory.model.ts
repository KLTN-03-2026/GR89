import mongoose, { Document, Schema } from "mongoose";

export interface IDocumentCategory extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
}

const documentCategorySchema = new Schema<IDocumentCategory>(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo danh mục là bắt buộc"],
    },
  },
  { timestamps: true }
);

export const DocumentCategory = mongoose.model<IDocumentCategory>(
  "DocumentCategory",
  documentCategorySchema
);
