import mongoose, { Schema, Document } from "mongoose";

export interface IIpaProgress extends Document {
  userId: Schema.Types.ObjectId;
  ipaId: Schema.Types.ObjectId;
  progress: number;
  studyTime?: number;
}

const ipaProgressSchema = new Schema<IIpaProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ipaId: {
    type: Schema.Types.ObjectId,
    ref: 'Ipa',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  studyTime: {
    type: Number,
    default: 0,
  }
})

export const IpaProgress = mongoose.model<IIpaProgress>('IpaProgress', ipaProgressSchema)