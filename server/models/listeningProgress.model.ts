import mongoose, { Document, Schema } from "mongoose";

export interface IListeningProgress extends Document {
  userId: mongoose.Types.ObjectId
  listeningId: mongoose.Types.ObjectId
  isActive?: boolean
  isCompleted?: boolean
  progress: number
  //point: number
  time: number
  studyTime: number
  date?: Date
  result: {
    index: number
    text: string
    isCorrect: boolean
  }[]
}

const listeningProgressSchema = new Schema<IListeningProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listeningId: { type: Schema.Types.ObjectId, ref: 'Listening', required: true },
  isActive: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  result: { type: [Object], default: [] },
  //point: { type: Number, default: 0 },
  time: { type: Number, default: 0 },
  studyTime: { type: Number, default: 0 },
  date: { type: Date, default: new Date() },
}, { timestamps: true })

listeningProgressSchema.index({ userId: 1, listeningId: 1 }, { unique: true })



export const ListeningProgress = mongoose.model<IListeningProgress>('ListeningProgress', listeningProgressSchema)

