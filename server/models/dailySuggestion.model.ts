import mongoose, { Schema, Document } from 'mongoose';

export interface IDailySuggestionItem {
  toObject(): unknown;
  title: string;
  description: string;
  href: string;
  icon?: string;
  color?: string;
}

export interface IDailySuggestion extends Document {
  user: mongoose.Types.ObjectId;
  dateString: string;
  suggestions: IDailySuggestionItem[];
  createdAt: Date;
  updatedAt: Date;
}

const suggestionItemSchema = new Schema<IDailySuggestionItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    href: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const dailySuggestionSchema = new Schema<IDailySuggestion>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateString: {
      type: String,
      required: true,
    },
    suggestions: {
      type: [suggestionItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

dailySuggestionSchema.index({ user: 1, dateString: 1 }, { unique: true });

export default mongoose.model<IDailySuggestion>('DailySuggestion', dailySuggestionSchema);
