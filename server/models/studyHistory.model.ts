import mongoose, { Schema, Document } from "mongoose";

export interface IStudyHistory extends Document {
  userId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing';

  // Results
  progress: number;               // 0-100
  duration: number;            // seconds
  correctAnswers: number;
  totalQuestions: number;

  // AI analysis fields
  weakPoints: string[];        // e.g., ["past-tense", "pronunciation-th"]
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  status: 'passed' | 'failed' | 'in_progress';
  createdAt: Date;

  // Link to detailed result
  resultId?: Schema.Types.ObjectId[];
  resultModel?: string;
  resultData?: unknown;
}

const studyHistorySchema = new Schema<IStudyHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
  category: {
    type: String,
    enum: ['grammar', 'vocabulary', 'reading', 'listening', 'speaking', 'ipa', 'writing'],
    required: true,
    index: true
  },

  progress: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },

  weakPoints: [{ type: String }],
  level: {
    type: String,
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
    required: true
  },

  status: {
    type: String,
    enum: ['passed', 'failed', 'in_progress'],
    default: 'in_progress'
  },

  // Link to detailed result (Dynamic ref)
  resultId: [{ type: Schema.Types.ObjectId, refPath: 'resultModel' }],
  resultModel: {
    type: String,
    enum: ['QuizResult', 'WritingUser', 'SpeakingProgress', 'IpaScoring', 'ListeningProgress']
  },
  resultData: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Index for fast query by AI
studyHistorySchema.index({ userId: 1, createdAt: -1 });
studyHistorySchema.index({ userId: 1, lessonId: 1, progress: -1 });
studyHistorySchema.index({ userId: 1, category: 1 });

export const StudyHistory = mongoose.model<IStudyHistory>('StudyHistory', studyHistorySchema);
