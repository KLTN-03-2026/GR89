import mongoose, { Document, Schema } from "mongoose";

export interface ISpeakingProgress extends Document {
  userId: mongoose.Types.ObjectId;
  speakingId: mongoose.Types.ObjectId;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  time: number;
  studyTime: number;
  lastAttempt: Date;
}

const speakingProgressSchema = new Schema<ISpeakingProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
  },
  speakingId: {
    type: Schema.Types.ObjectId,
    ref: 'Speaking',
    required: [true, 'Speaking ID là bắt buộc'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress phải từ 0-100'],
    max: [100, 'Progress phải từ 0-100'],
  },
  time: {
    type: Number,
    default: 0,
  },
  studyTime: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

speakingProgressSchema.index({ userId: 1, speakingId: 1 }, { unique: true });
speakingProgressSchema.index({ userId: 1, isCompleted: 1 });
speakingProgressSchema.index({ speakingId: 1 });

export const SpeakingProgress = mongoose.model<ISpeakingProgress>('SpeakingProgress', speakingProgressSchema);
