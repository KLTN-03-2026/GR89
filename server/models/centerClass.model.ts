import mongoose, { Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface ICenterClass extends Document {
  name: string
  category: 'kids' | 'teenager' | 'adult'
  teacher: mongoose.Types.ObjectId
  startDate: Date
  schedule: string
  status: 'opening' | 'ongoing' | 'finished'
  password: string
  maxStudents?: number | null
  isActive: boolean
  students: {
    user: mongoose.Types.ObjectId
    joinDate: Date
  }[]
  documents: mongoose.Types.ObjectId[]
  homeworks: mongoose.Types.ObjectId[]
}

export interface ICenterClassModel extends mongoose.Model<ICenterClass> {
  paginate(query?: any, options?: any): Promise<any>
}

const centerClassSchema = new Schema<ICenterClass>(
  {
    name: {
      type: String,
      required: [true, 'Tên lớp học là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['kids', 'teenager', 'adult'],
      required: [true, 'Danh mục lớp học là bắt buộc'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Giáo viên là bắt buộc'],
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    schedule: {
      type: String,
      required: [true, 'Lịch học là bắt buộc'],
    },
    status: {
      type: String,
      enum: ['opening', 'ongoing', 'finished'],
      default: 'opening',
    },
    password: {
      type: String,
      length: 6,
      required: [true, 'Mật khẩu là bắt buộc'],
      match: [/^\d{6}$/, 'Mật khẩu phải là 6 ký tự số'],
      trim: true,
    },
    maxStudents: {
      type: Number,
      default: 40,
      min: [1, 'Số học viên tối đa phải lớn hơn 0'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    students: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        joinDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'GlobalDocument',
      },
    ],
    homeworks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Homework',
      },
    ],
  },
  {
    timestamps: true,
  },
)

centerClassSchema.plugin(mongoosePaginate)

export const CenterClass = mongoose.model<ICenterClass, ICenterClassModel>(
  'CenterClass',
  centerClassSchema,
)
