import mongoose, { Document, Schema } from 'mongoose'
import { IQuizResult } from './quizzResult.model'

export interface IListeningProgress extends Document {
  studyTime: number
  quizzesResults: IQuizResult[]
  directionResults: {
    index: number
    text: string
    isCorrect: boolean
  }[]
}

const listeningProgressSchema = new Schema<IListeningProgress>(
  {
    directionResults: { type: [Object], default: [] },
    quizzesResults: { type: [mongoose.Types.ObjectId], ref: 'Quiz' },
    studyTime: { type: Number, default: 0 }
  },
  { timestamps: true },
)

export const ListeningProgress = mongoose.model<IListeningProgress>(
  'ListeningProgress',
  listeningProgressSchema,
)
