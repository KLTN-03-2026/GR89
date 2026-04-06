import mongoose, { Schema, model, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ISpeaking extends Document {
  _id: mongoose.Types.ObjectId
  title: string;
  description?: string;
  videoUrl: Schema.Types.ObjectId;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  orderIndex: number;
  isActive: boolean;
  isVipRequired: boolean;
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for pagination result
export interface ISpeakingPaginateResult {
  speakings: ISpeaking[]
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

export interface ISpeakingModel extends mongoose.Model<ISpeaking> {
  paginate(query?: any, options?: any): Promise<ISpeakingPaginateResult>
}



const speakingSchema = new Schema<ISpeaking>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoUrl: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Video URL is required']
  },
  level: {
    type: String,
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
    default: "A1",
  },
  orderIndex: {
    type: Number,
    required: [true, 'Order index is required'],
    min: [1, 'Order index must be greater than 0']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isVipRequired: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo là bắt buộc'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});

// Thêm indexes cho search và sort
speakingSchema.index({ title: 'text', description: 'text' }); // Text search
speakingSchema.index({ isActive: 1 });
speakingSchema.index({ createdBy: 1 });
speakingSchema.index({ createdAt: -1 });
speakingSchema.index({ orderIndex: 1 });

// Plugin mongoose-paginate-v2
speakingSchema.plugin(mongoosePaginate);

export const Speaking = model<ISpeaking, ISpeakingModel>('Speaking', speakingSchema);
