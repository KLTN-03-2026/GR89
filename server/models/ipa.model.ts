import mongoose, { Schema, model, mongo } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IExample {
  word: string
  phonetic: string
  vietnamese: string
}

export interface IIpa extends Document {
  _id: string
  sound: string
  soundType: 'vowel' | 'consonant' | 'diphthong'
  image: mongoose.Types.ObjectId
  video: mongoose.Types.ObjectId
  description: string
  examples: IExample[]
  orderIndex: number
  isActive: boolean
  isVipRequired: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

// Interface for pagination result (with customLabels from service)
export interface IIpaPaginateResult {
  ipas: IIpa[]
  total: number
  totalDocs?: number
  limit: number
  page?: number
  pages: number
  totalPages?: number
  hasNext: boolean
  hasNextPage?: boolean // original field
  hasPrev: boolean // customLabel for hasPrevPage
  hasPrevPage?: boolean // original field
  next?: number | null // customLabel for nextPage
  nextPage?: number | null // original field
  prev?: number | null // customLabel for prevPage
  prevPage?: number | null // original field
  pagingCounter: number
  meta?: any
}

export interface IIpaModel extends mongoose.Model<IIpa> {
  paginate(query?: any, options?: any): Promise<IIpaPaginateResult>
}

const ipaSchema = new Schema<IIpa>({
  sound: {
    type: String,
    required: [true, 'Vui lòng nhập âm'],
    unique: true,
    trim: true
  },
  soundType: {
    type: String,
    enum: ['vowel', 'consonant', 'diphthong'],
    required: [true, 'Vui lòng chọn loại âm'],
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Vui lòng chọn ảnh'],
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Vui lòng chọn video'],
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả'],
  },
  orderIndex: {
    type: Number,
    index: true,
    unique: true,
  },
  examples: {
    type: [{
      word: { type: String, required: true },
      phonetic: { type: String, required: true },
      vietnamese: { type: String, required: true },
    }],
    default: [],
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

// Thêm indexes cho search và sort
ipaSchema.index({ sound: 'text', description: 'text' }); // Text search
ipaSchema.index({ soundType: 1 });
ipaSchema.index({ orderIndex: 1 });
ipaSchema.index({ createdAt: -1 });

// Plugin mongoose-paginate-v2
ipaSchema.plugin(mongoosePaginate);

// Middleware tự động tạo orderIndex
ipaSchema.pre("validate", async function (this: IIpa, next) {
  if ((this as any).isNew && !this.orderIndex) {
    this.orderIndex = await Ipa.countDocuments() + 1;
  }
  next();
});

// Middleware xử lý insertMany
ipaSchema.pre("insertMany", async function (next, docs: IIpa[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next();
  const start = await Ipa.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next();
});

// Middleware cập nhật lại thứ tự sau khi xóa
ipaSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Ipa.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    );
  }
});

export const Ipa = model<IIpa, IIpaModel>('Ipa', ipaSchema)