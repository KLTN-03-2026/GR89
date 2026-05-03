import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz extends Document {
  question: string;
  type: 'Multiple Choice' | 'Fill in the blank';
  options?: string[];
  answer: string;
  explanation: string;
}

const quizSchema = new Schema<IQuiz>({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Multiple Choice', 'Fill in the blank'],
    required: [true, 'Vui lòng chọn loại câu hỏi'],
  },
  options: {
    type: [String],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Vui lòng nhập đáp án'],
    trim: true,
  },
  explanation: {
    type: String,
    trim: true,
  }
})

// Index để tìm kiếm nhanh
quizSchema.index({ vocabularyTopicId: 1 });
quizSchema.index({ isActive: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);



