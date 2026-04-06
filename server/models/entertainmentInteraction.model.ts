import mongoose, { Document, Schema } from 'mongoose'

export interface IEntertainmentInteraction extends Document {
  userId: mongoose.Types.ObjectId
  entertainmentId: mongoose.Types.ObjectId
  type?: string
  liked: boolean
  watched: boolean
  totalWatchTime: number
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const entertainmentInteractionSchema = new Schema<IEntertainmentInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entertainmentId: { type: Schema.Types.ObjectId, ref: 'Entertainment', required: true, index: true },
  type: { type: String, enum: ['movie', 'music', 'podcast'], required: true },
  liked: { type: Boolean, default: false },
  watched: { type: Boolean, default: false },
  totalWatchTime: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true })

entertainmentInteractionSchema.index({ userId: 1, entertainmentId: 1 }, { unique: true })

export const EntertainmentInteraction = mongoose.model<IEntertainmentInteraction>('EntertainmentInteraction', entertainmentInteractionSchema)


