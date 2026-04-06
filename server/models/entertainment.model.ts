import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IEntertainment extends Document {
  createdBy: mongoose.Types.ObjectId
  title: string
  description?: string
  videoUrl?: mongoose.Types.ObjectId | string
  thumbnailUrl?: mongoose.Types.ObjectId | string
  type?: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  status?: boolean
  isVipRequired?: boolean
  author?: string
  parentId?: mongoose.Types.ObjectId | string
  orderIndex?: number
}

export interface IEntertainmentPaginateResult {
  entertainments: IEntertainment[]
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

export interface IEntertainmentModel extends mongoose.Model<IEntertainment> {
  paginate(query?: any, options?: any): Promise<IEntertainmentPaginateResult>
}

const entertainmentSchema = new Schema<IEntertainment>({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo là bắt buộc']
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  videoUrl: { type: Schema.Types.ObjectId, ref: 'Media' },
  thumbnailUrl: { type: Schema.Types.ObjectId, ref: 'Media' },
  type: { type: String, enum: ['movie', 'music', 'podcast', 'series', 'episode'], default: 'movie' },
  status: { type: Boolean, default: true },
  isVipRequired: { type: Boolean, default: true },
  author: { type: String, trim: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Entertainment' },
  orderIndex: { type: Number, default: 0 }
}, { timestamps: true })

// Indexes
entertainmentSchema.index({ title: 'text', description: 'text' });
entertainmentSchema.index({ createdBy: 1 });
entertainmentSchema.index({ createdAt: -1 });

// Plugin paginate
entertainmentSchema.plugin(mongoosePaginate);

export const Entertainment = mongoose.model<IEntertainment, IEntertainmentModel>('Entertainment', entertainmentSchema)


