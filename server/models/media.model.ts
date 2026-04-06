import mongoose, { Document, Schema } from "mongoose";

export interface MediaSubtitlePreview {
  start: string;
  end: string;
  english?: string;
  phonetic?: string;
  vietnamese?: string;
  raw?: string;
}

export interface MediaSubtitle {
  label?: string;
  languagePair?: string;
  fileUrl: string;
  format?: string;
  originalName?: string;
  totalEntries?: number;
  preview?: MediaSubtitlePreview[];
}

export interface IMedia extends Document {
  type: 'image' | 'audio' | 'video';
  url: string;
  publicId?: string;
  title?: string; // Tên tùy chỉnh cho media
  format: string;
  size: number;
  duration: number;
  width?: number; // Cho image/video
  height?: number; // Cho image/video
  thumbnail?: mongoose.Types.ObjectId; // Cho video
  userId: mongoose.Types.ObjectId;
  subtitles?: MediaSubtitle[];
}

const mediaSchema = new Schema<IMedia>({
  type: {
    type: String, enum: ['image', 'audio', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: [true, 'Vui lòng nhập đường dẫn media'],
    unique: true
  },
  publicId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    default: ''
  },
  format: {
    type: String,
  },
  size: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  thumbnail: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  subtitles: {
    type: [{
      label: String,
      languagePair: String,
      fileUrl: String,
      format: String,
      originalName: String,
      totalEntries: Number,
      preview: [{
        start: String,
        end: String,
        english: String,
        phonetic: String,
        vietnamese: String,
        raw: String
      }]
    }],
    default: []
  }
}, { timestamps: true })

mediaSchema.index({ url: 1 })

export const Media = mongoose.model<IMedia>('Media', mediaSchema)

