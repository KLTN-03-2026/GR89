import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IVocabularyTopic extends Document {
  name: string;
  image: Schema.Types.ObjectId;
  quizzes: Schema.Types.ObjectId[];
  vocabularies: Schema.Types.ObjectId[];
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  orderIndex: number;
  isActive: boolean;
  isVipRequired: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Interface for pagination result
export interface IVocabularyTopicPaginateResult {
  topics: IVocabularyTopic[]
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

export interface IVocabularyTopicModel extends mongoose.Model<IVocabularyTopic> {
  paginate(query?: any, options?: any): Promise<IVocabularyTopicPaginateResult>
}

const vocabularyTopicSchema = new Schema<IVocabularyTopic>({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên chủ đề'],
    trim: true,
    unique: true
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Vui lòng tải ảnh lên'],
  },
  quizzes: {
    type: [Schema.Types.ObjectId],
    ref: 'Quiz',
    default: []
  },
  vocabularies: {
      type: [Schema.Types.ObjectId],
      ref: 'Vocabulary',
      default: []
    },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'A1',
    },
    orderIndex: {
      type: Number,
    index: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isVipRequired: {
    type: Boolean,
    default: true,
  },
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

vocabularyTopicSchema.index({ orderIndex: 1 });
vocabularyTopicSchema.index({ isActive: 1 });
vocabularyTopicSchema.index({ name: 'text' });
vocabularyTopicSchema.index({ createdAt: -1 });

// Middleware để tự động đánh số thứ tự trước khi save
vocabularyTopicSchema.pre('validate', async function (this: IVocabularyTopic, next) {
  if (this.isNew && !this.orderIndex) {
    // Đếm số document hiện có + 1
    this.orderIndex = await VocabularyTopic.countDocuments() + 1
  }
  next()
})

vocabularyTopicSchema.pre('insertMany', async function (next, docs: IVocabularyTopic[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next()
  const start = await VocabularyTopic.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next()
});

// Middleware để cập nhật lại thứ tự sau khi xóa
vocabularyTopicSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Giảm orderIndex của các vocabulary topic có orderIndex > topic bị xóa
    await VocabularyTopic.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    )
  }
})

// Plugin mongoose-paginate-v2
vocabularyTopicSchema.plugin(mongoosePaginate);

export const VocabularyTopic = mongoose.model<IVocabularyTopic, IVocabularyTopicModel>('VocabularyTopic', vocabularyTopicSchema);