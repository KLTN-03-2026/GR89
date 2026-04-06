import mongoose, { Schema, Model } from "mongoose"

export interface IWritingUser extends Document {
  writing: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  content: string
  revisedContent: string
  rubricContent: {
    point: number
    feedback: string[]
  }
  rubricStructure: {
    point: number
    feedback: string[]
  }
  rubricGrammar: {
    point: number
    feedback: string[]
  }
  rubricVocabulary: {
    point: number
    feedback: string[]
  }
  overallFeedback: string
  suggested: string[]
  isActive: boolean
  isCompleted: boolean
  studyTime: number
}

const writingUserSchema = new Schema<IWritingUser>({
  writing: { type: Schema.Types.ObjectId, ref: 'Writing', required: [true, 'bài viết không được để trống'] },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'người dùng không được để trống'] },
  content: { type: String },
  revisedContent: { type: String },
  rubricContent: {
    point: { type: Number, default: 0 },
    feedback: { type: [String] },
  },
  rubricStructure: {
    point: { type: Number, default: 0 },
    feedback: { type: [String] },
  },
  rubricGrammar: {
    point: { type: Number, default: 0 },
    feedback: { type: [String] },
  },
  rubricVocabulary: {
    point: { type: Number, default: 0 },
    feedback: { type: [String] },
  },
  overallFeedback: { type: String },
  suggested: { type: [String] },
  isActive: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false },
  studyTime: { type: Number, default: 0 },
})

writingUserSchema.index({ writing: 1, user: 1 })

export const writingUserModel = mongoose.model<IWritingUser>('WritingUser', writingUserSchema) as Model<IWritingUser>