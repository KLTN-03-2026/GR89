import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IVocabularyReading {
  _id?: mongoose.Types.ObjectId
  word: string
  phonetic: string
  definition: string
  vietnamese: string
  example: string
}

export interface IReading extends Document {
  title: string
  description: string
  paragraphEn: string
  paragraphVi: string
  image?: mongoose.Types.ObjectId
  vocabulary: IVocabularyReading[]
  quizzes: mongoose.Types.ObjectId[]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isActive?: boolean
  isVipRequired?: boolean
  orderIndex: number
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

// Interface for pagination result
export interface IReadingPaginateResult {
  readings: IReading[]
  totalDocs: number
  limit: number
  page?: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
  pagingCounter: number
  meta?: any
}

export interface IReadingModel extends mongoose.Model<IReading> {
  paginate(query?: any, options?: any): Promise<IReadingPaginateResult>
}

const readingSchema = new Schema<IReading>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  paragraphEn: { type: String, required: true },
  paragraphVi: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: 'Media' },
  vocabulary: {
    type: [{
      _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      word: { type: String, required: true },
      phonetic: { type: String, required: true },
      definition: { type: String, required: true },
      vietnamese: { type: String, required: true },
      example: { type: String, required: true },
    }],
    default: [],
  },
  quizzes: { type: [String], required: true, default: [], ref: 'Quiz' },
  level: {
    type: String,
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
    default: "A1",
  },
  isActive: { type: Boolean, default: false },
  isVipRequired: { type: Boolean, default: true },
  orderIndex: { type: Number, index: true, unique: true },
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
readingSchema.index({ title: 'text', description: 'text', paragraphEn: 'text', paragraphVi: 'text' }); // Text search
readingSchema.index({ isActive: 1 });
readingSchema.index({ orderIndex: 1 });
readingSchema.index({ createdBy: 1 });
readingSchema.index({ createdAt: -1 });

// Plugin mongoose-paginate-v2
readingSchema.plugin(mongoosePaginate);

// Middleware để tự động đánh số thứ tự trước khi save
readingSchema.pre('validate', async function (this: IReading, next) {
  if (this.isNew && !this.orderIndex) {
    // Đếm số document hiện có + 1
    this.orderIndex = await Reading.countDocuments() + 1
  }
  next()
})

readingSchema.pre('insertMany', async function (next, docs: IReading[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next()
  const start = await Reading.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next()
});

// Middleware để cập nhật lại thứ tự sau khi xóa
readingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Giảm orderIndex của các reading có orderIndex > reading bị xóa
    await Reading.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    )
  }
})

export const Reading = mongoose.model<IReading, IReadingModel>('Reading', readingSchema)