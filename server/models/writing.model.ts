import mongoose, { Schema, Model, Document } from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2'

export interface IWriting extends Document {
  title: string
  description: string
  minWords: number
  maxWords: number
  duration: number
  suggestedVocabulary: string[]
  suggestedStructure: {
    title: string
    description: string
    step: number
  }[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  orderIndex: number
  isActive: boolean
  isVipRequired: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

// Interface for pagination result
export interface IWritingPaginateResult {
  docs: IWriting[]
  total: number
  limit: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  next?: number
  prev?: number
  pagingCounter: number
  meta?: any
}

export interface IWritingModel extends mongoose.Model<IWriting> {
  paginate(query?: any, options?: any): Promise<IWritingPaginateResult>
}

const writingSchema = new Schema<IWriting>({
  title: { type: String, required: [true, 'tiêu đề bài viết không được để trống'], unique: true },
  description: { type: String, required: [true, 'mô tả bài viết không được để trống'] },
  minWords: { type: Number, required: [true, 'số từ tối thiểu không được để trống'] },
  maxWords: { type: Number, required: [true, 'số từ tối đa không được để trống'] },
  duration: { type: Number, required: [true, 'thời gian làm bài không được để trống'] },
  suggestedVocabulary: { type: [String], required: [true, 'từ vựng không được để trống'] },
  suggestedStructure: {
    type: [{ title: String, description: String, step: Number }],
    required: [true, 'cấu trúc bài viết không được để trống']
  },
  level: {
    type: String,
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
    default: "A1",
  },
  orderIndex: { type: Number, index: true, unique: true },
  isActive: { type: Boolean, default: false },
  isVipRequired: { type: Boolean, default: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo là bắt buộc'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true })

// Thêm indexes cho search và sort
writingSchema.index({ title: 'text', description: 'text' }); // Text search
writingSchema.index({ isActive: 1 });
writingSchema.index({ orderIndex: 1 });
writingSchema.index({ createdBy: 1 });
writingSchema.index({ createdAt: -1 });

// Plugin mongoose-paginate-v2
writingSchema.plugin(mongoosePaginate);

// Middleware để tự động đánh số thứ tự trước khi save
writingSchema.pre('validate', async function (this: IWriting, next) {
  if (this.isNew && !this.orderIndex) {
    // Đếm số document hiện có + 1
    this.orderIndex = await writingModel.countDocuments() + 1
  }
  next()
})

writingSchema.pre('insertMany', async function (next, docs: IWriting[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next()
  const start = await writingModel.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next()
});

// Middleware để cập nhật lại thứ tự sau khi xóa
writingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Giảm orderIndex của các writing có orderIndex > writing bị xóa
    await writingModel.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    )
  }
})

export const writingModel = mongoose.model<IWriting, IWritingModel>('Writing', writingSchema)