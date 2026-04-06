import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing';

  progress: number;      // 0 - 100%
  point: number;         // Best score
  isCompleted: boolean;
  studyTime: number;     // Total study time for this lesson (seconds)
  lastLearnDate: Date;
  isActive: boolean;

  // Metadata của lần đạt điểm cao nhất (Best Result)
  correctAnswers?: number;
  totalQuestions?: number;
  weakPoints?: string[];
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  // Lưu ID kết quả bài tập (Hỗ trợ nhiều loại model khác nhau)
  resultId?: Schema.Types.ObjectId[];
  resultModel?: string;

  // Lưu dữ liệu kết quả đặc thù (Listening, Writing, Speaking, IPA)
  resultData?: any;
}

const userProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
  category: {
    type: String,
    enum: ['grammar', 'vocabulary', 'reading', 'listening', 'speaking', 'ipa', 'writing'],
    required: true,
    index: true
  },

  progress: { type: Number, default: 0, min: 0, max: 100 },
  point: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  studyTime: { type: Number, default: 0 },
  lastLearnDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

  // Metadata bổ sung
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  weakPoints: [{ type: String }],
  level: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },

  // Kết quả chi tiết của lần đạt điểm cao nhất (Hỗ trợ dynamic ref)
  resultId: [{ type: Schema.Types.ObjectId, refPath: 'resultModel' }],
  resultModel: {
    type: String,
    enum: ['QuizResult', 'WritingUser', 'SpeakingProgress', 'IpaProgress', 'ListeningProgress', 'StudyHistory']
  },
  resultData: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Ensure a user has only one progress record per lesson
userProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
