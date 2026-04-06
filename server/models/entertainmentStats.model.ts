import mongoose, { Document, Schema } from 'mongoose'

export interface IEntertainmentStats extends Document {
  userId: mongoose.Types.ObjectId
  type: 'movie' | 'music' | 'podcast'
  viewedCount: number
  totalItems: number
  totalWatchTime: number
  lastUpdated: Date
}

const entertainmentStatsSchema = new Schema<IEntertainmentStats>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['movie', 'music', 'podcast'], required: true },
  viewedCount: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  totalWatchTime: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true })

entertainmentStatsSchema.index({ userId: 1, type: 1 }, { unique: true })

export const EntertainmentStats = mongoose.model<IEntertainmentStats>('EntertainmentStats', entertainmentStatsSchema)

