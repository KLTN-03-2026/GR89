import mongoose, { Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface ISubmission {
  user: mongoose.Types.ObjectId
  content: string
  feedback: string
  submittedAt: Date
  gradedAt?: Date
  status: 'pending' | 'graded'
}

export interface IHomework extends Document {
  title: string
  description: string
  submittedAt: Date
  deadline: Date
  submissions: ISubmission[]
}

export interface IHomeworkModel extends mongoose.Model<IHomework> {
  paginate(query?: any, options?: any): Promise<any>
}

const submissionSchema = new Schema<ISubmission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người nộp bài là bắt buộc'],
    },
    content: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
  },
  { _id: true },
)

const homeworkSchema = new Schema<IHomework>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài tập là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Hạn nộp bài là bắt buộc'],
    },
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  },
)

homeworkSchema.plugin(mongoosePaginate)

export const Homework = mongoose.model<IHomework, IHomeworkModel>('Homework', homeworkSchema)
