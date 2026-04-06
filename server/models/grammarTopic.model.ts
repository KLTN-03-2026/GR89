import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IGrammarExample {
  en: string;
  vi?: string;
}

export interface IGrammarTable {
  headers: string[];
  rows: string[][];
}

export interface IGrammarSection {
  id: string;
  title: string;
  description?: string;
  note?: string;
  formula?: string;
  examples?: IGrammarExample[];
  list?: string[];
  table?: IGrammarTable;
}

export type GrammarPracticeType = "fill_blank" | "multiple_choice" | "correct_sentence";

export interface IGrammarPracticeQuestion {
  id: string;
  type: GrammarPracticeType;
  question: string;
  options?: string[];
  wrongSentence?: string;
  answer: string;
  hint: string;
}

export interface IGrammarTopic extends Document {
  title: string;
  description?: string;
  orderIndex: number;
  sections: IGrammarSection[];
  practice: IGrammarPracticeQuestion[];
  quizzes: mongoose.Types.ObjectId[];
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  isActive: boolean;
  isVipRequired: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrammarTopicPaginateResult {
  grammarTopics: IGrammarTopic[];
  total: number;
  totalDocs?: number;
  limit: number;
  page?: number;
  pages: number;
  totalPages?: number;
  hasNext: boolean;
  hasNextPage?: boolean;
  hasPrev: boolean;
  hasPrevPage?: boolean;
  next?: number | null;
  nextPage?: number | null;
  prev?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  meta?: any;
}

export interface IGrammarTopicModel extends mongoose.Model<IGrammarTopic> {
  paginate(query?: any, options?: any): Promise<IGrammarTopicPaginateResult>;
}

const grammarExampleSchema = new Schema<IGrammarExample>(
  {
    en: {
      type: String,
      required: [true, "Ví dụ tiếng Anh là bắt buộc"],
      trim: true,
    },
    vi: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const grammarTableSchema = new Schema<IGrammarTable>(
  {
    headers: {
      type: [String],
      default: [],
    },
    rows: {
      type: [[String]],
      default: [],
    },
  },
  { _id: false }
);

const grammarSectionSchema = new Schema<IGrammarSection>(
  {
    id: {
      type: String,
      required: [true, "ID section là bắt buộc"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề section là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    formula: {
      type: String,
      trim: true,
    },
    examples: {
      type: [grammarExampleSchema],
      default: [],
    },
    list: {
      type: [String],
      default: [],
    },
    table: {
      type: grammarTableSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const grammarPracticeQuestionSchema = new Schema<IGrammarPracticeQuestion>(
  {
    id: {
      type: String,
      required: [true, "ID bài luyện tập là bắt buộc"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["fill_blank", "multiple_choice", "correct_sentence"],
      required: [true, "Loại bài luyện tập là bắt buộc"],
    },
    question: {
      type: String,
      required: [true, "Câu hỏi luyện tập là bắt buộc"],
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    wrongSentence: {
      type: String,
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Đáp án là bắt buộc"],
      trim: true,
    },
    hint: {
      type: String,
      required: [true, "Gợi ý là bắt buộc"],
      trim: true,
    },
  },
  { _id: false }
);

const grammarTopicSchema = new Schema<IGrammarTopic>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề bài ngữ pháp là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    orderIndex: {
      type: Number,
      index: true,
      unique: true,
    },
    sections: {
      type: [grammarSectionSchema],
      default: [],
    },
    practice: {
      type: [grammarPracticeQuestionSchema],
      default: [],
    },
    quizzes: {
      type: [Schema.Types.ObjectId],
      ref: "Quiz",
      default: [],
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: "A1",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVipRequired: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo là bắt buộc"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

grammarTopicSchema.index({ title: "text", description: "text" });
grammarTopicSchema.index({ isActive: 1 });
grammarTopicSchema.index({ isVipRequired: 1 });
grammarTopicSchema.index({ orderIndex: 1 });
grammarTopicSchema.index({ createdBy: 1 });

grammarTopicSchema.pre("validate", async function (this: IGrammarTopic, next) {
  if (this.isNew && !this.orderIndex) {
    this.orderIndex = await GrammarTopic.countDocuments() + 1;
  }
  next();
});

grammarTopicSchema.pre("insertMany", async function (next, docs: IGrammarTopic[]) {
  if (!Array.isArray(docs) || docs.length === 0) return next();
  const start = await GrammarTopic.countDocuments();
  for (let i = 0; i < docs.length; i++) {
    if (!(docs[i] as any).orderIndex) (docs[i] as any).orderIndex = start + i + 1;
  }
  next();
});

grammarTopicSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await GrammarTopic.updateMany(
      { orderIndex: { $gt: doc.orderIndex } },
      { $inc: { orderIndex: -1 } }
    );
  }
});

grammarTopicSchema.plugin(mongoosePaginate);

export const GrammarTopic = mongoose.model<IGrammarTopic, IGrammarTopicModel>("GrammarTopic", grammarTopicSchema);
