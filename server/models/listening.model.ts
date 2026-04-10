import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IListening extends Document {
  /** Tham chiếu tới collection ListeningQuiz (lượt 1 — trắc nghiệm ý chính) */
  quizzes?: mongoose.Types.ObjectId[]
  title: string
  description: string
  audio: mongoose.Types.ObjectId
  subtitle: string
  subtitleVi: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isActive: boolean
  isVipRequired: boolean
  orderIndex: number
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

// Interface for pagination result
export interface IListeningPaginateResult {
  listenings: IListening[]
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

export interface IListeningModel extends mongoose.Model<IListening> {
  paginate(query?: any, options?: any): Promise<IListeningPaginateResult>
}

const listeningSchema = new Schema<IListening>({
  quizzes: {
    type: [{ type: Schema.Types.ObjectId, ref: 'ListeningQuiz' }],
    default: [],
  },
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  audio: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  subtitle: { type: String, required: true },
  subtitleVi: { type: String, required: true },
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
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true })

// Thêm indexes cho search và sort
listeningSchema.index({ title: 'text', description: 'text', subtitle: 'text', subtitleVi: 'text' }); // Text search
listeningSchema.index({ isActive: 1 });
listeningSchema.index({ orderIndex: 1 });
listeningSchema.index({ createdAt: -1 });

// Plugin mongoose-paginate-v2
listeningSchema.plugin(mongoosePaginate);

// Middleware để tự động đánh số thứ tự trước khi save
listeningSchema.pre('validate', async function (this: IListening, next) {
  if (this.isNew && !this.orderIndex) {
    // Đếm số document hiện có + 1
    this.orderIndex = await Listening.countDocuments() + 1
  }
  next()
})

listeningSchema.pre('insertMany', async function (next, docs: IListening[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next()
  const start = await Listening.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next()
});

// Middleware để cập nhật lại thứ tự sau khi xóa
listeningSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Giảm orderIndex của các listening có orderIndex > listening bị xóa
    await Listening.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    )
  }
})


export const Listening = mongoose.model<IListening, IListeningModel>('Listening', listeningSchema)