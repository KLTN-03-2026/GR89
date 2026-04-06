import mongoose, { Document, Schema } from "mongoose";

export interface IVocabulary extends Document {
  word: string;
  transcription: string;
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition' | 'Conjunction' | 'Interjection'; //Từ loại
  definition: string;
  vietnameseMeaning: string;
  example: string;
  image: mongoose.Types.ObjectId;
  isVipRequired: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const vocabularySchema = new Schema<IVocabulary>({
  word: {
    type: String,
    required: [true, 'Vui lòng nhập từ'],
    trim: true,
  },
  transcription: {
    type: String,
    required: [true, 'Vui lòng nhập phiên âm'],
    trim: true,
  },
  partOfSpeech: {
    type: String,
    enum: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Preposition', 'Conjunction', 'Interjection'],
    required: [true, 'Vui lòng chọn từ loại'],
  },
  definition: {
    type: String,
    required: [true, 'Vui lòng nhập định nghĩa'],
    trim: true,
  },
  vietnameseMeaning: {
    type: String,
    required: [true, 'Vui lòng nhập nghĩa tiếng Việt'],
    trim: true,
  },
  example: {
    type: String,
    required: [true, 'Vui lòng nhập ví dụ'],
    trim: true,
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Vui lòng chọn ảnh'],
  },
  isVipRequired: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo là bắt buộc'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true })

export const Vocabulary = mongoose.model<IVocabulary>('Vocabulary', vocabularySchema);