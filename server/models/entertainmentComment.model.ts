import mongoose, { Document, Schema } from 'mongoose'

export interface IEntertainmentComment extends Document {
  userId: mongoose.Types.ObjectId
  entertainmentId: mongoose.Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const entertainmentCommentSchema = new Schema<IEntertainmentComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entertainmentId: { type: Schema.Types.ObjectId, ref: 'Entertainment', required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 1000 }
}, { timestamps: true })

entertainmentCommentSchema.index({ entertainmentId: 1, createdAt: -1 })

export const EntertainmentComment = mongoose.model<IEntertainmentComment>('EntertainmentComment', entertainmentCommentSchema)
