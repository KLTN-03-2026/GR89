import mongoose, { Document, Schema } from "mongoose";

export interface ISpeakingSentencePractice extends Document {
  userId: mongoose.Types.ObjectId;
  speakingId: mongoose.Types.ObjectId;
  sentenceIndex: number;
  score: number;
  referenceText: string;
  aiFeedback?: string;
}

const speakingSentencePracticeSchema = new Schema<ISpeakingSentencePractice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    speakingId: {
      type: Schema.Types.ObjectId,
      ref: "Speaking",
      required: true,
      index: true,
    },
    sentenceIndex: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, min: 0, max: 100 },
    referenceText: { type: String, required: true },
    aiFeedback: { type: String },
  },
  { timestamps: true }
);

speakingSentencePracticeSchema.index({ userId: 1, speakingId: 1, sentenceIndex: 1, createdAt: -1 });

export const SpeakingSentencePractice = mongoose.model<ISpeakingSentencePractice>(
  "SpeakingSentencePractice",
  speakingSentencePracticeSchema
);
