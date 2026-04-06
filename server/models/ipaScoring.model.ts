import mongoose, { Schema, Document } from "mongoose";

export interface IIpaScoring extends Document {
  userId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  referenceText: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: any[];
  totalWords: number;
  correctWords: number;
  errorWords: number;
  feedback: string;
  detailedFeedback: string;
  gradingSystem: string;
  granularity: string;
}

const ipaScoringSchema = new Schema<IIpaScoring>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
  referenceText: { type: String, required: true },
  overallScore: { type: Number, default: 0 },
  accuracyScore: { type: Number, default: 0 },
  fluencyScore: { type: Number, default: 0 },
  completenessScore: { type: Number, default: 0 },
  words: { type: Schema.Types.Mixed, default: [] },
  totalWords: { type: Number, default: 0 },
  correctWords: { type: Number, default: 0 },
  errorWords: { type: Number, default: 0 },
  feedback: { type: String },
  detailedFeedback: { type: String },
  gradingSystem: { type: String, default: 'HundredMark' },
  granularity: { type: String, default: 'Phoneme' }
}, { timestamps: true });

ipaScoringSchema.index({ userId: 1, lessonId: 1 });

export const IpaScoring = mongoose.model<IIpaScoring>('IpaScoring', ipaScoringSchema);
