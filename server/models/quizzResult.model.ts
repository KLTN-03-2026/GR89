import mongoose, { Document, Schema } from "mongoose";

export interface IQuizResult extends Document {
  questionNumber: number;
  userAnswer: string;
  quizId: Schema.Types.ObjectId;
  isCorrect: boolean;
}

const quizResultSchema = new Schema<IQuizResult>({
  questionNumber: { type: Number, required: true },
  userAnswer: { type: String, default: '' },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  isCorrect: { type: Boolean, default: false },
})

export const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);