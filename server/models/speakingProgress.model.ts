import mongoose, { Schema, Document } from 'mongoose'

// ===== TYPE =====
export interface AssessmentWordResult {
  word: string
  score: number
  phonetic?: string
  phonemes?: {
    phoneme: string
    accuracyScore: number
  }[]
}

export interface ISpeakingProgress extends Document {
  userId: Schema.Types.ObjectId
  lessonId: Schema.Types.ObjectId
  index: number
  score: number
  words?: AssessmentWordResult[]
  sentence: string
  aiFeedback?: string
}

// ===== SCHEMA =====
const speakingProgressSchema = new Schema<ISpeakingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Speaking' },
    index: { type: Number },
    score: { type: Number },
    words: [
      {
        word: { type: String },
        score: { type: Number },
        phonetic: { type: String },
        phonemes: [
          {
            phoneme: { type: String },
            accuracyScore: { type: Number }
          }
        ]
      }
    ],
    sentence: { type: String },
    aiFeedback: { type: String }
  },
  { timestamps: true }
)

// ===== MODEL =====
export const SpeakingProgress =
  mongoose.models.SpeakingProgress ||
  mongoose.model<ISpeakingProgress>('SpeakingProgress', speakingProgressSchema)