import mongoose, { Schema, Document } from 'mongoose'

export interface IListeningQuiz extends Document {
  listeningId: mongoose.Types.ObjectId
  question: string
  options: string[]
  answer: string
  orderIndex: number
}

const listeningQuizSchema = new Schema<IListeningQuiz>(
  {
    listeningId: {
      type: Schema.Types.ObjectId,
      ref: 'Listening',
      required: true,
      index: true,
    },
    question: { type: String, required: true, trim: true },
    options: [{ type: String, trim: true, required: true }],
    answer: { type: String, required: true, trim: true },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
)

listeningQuizSchema.index({ listeningId: 1, orderIndex: 1 })

export const ListeningQuiz = mongoose.model<IListeningQuiz>('ListeningQuiz', listeningQuizSchema)
