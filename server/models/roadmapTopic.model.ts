import mongoose, { Document, Schema } from "mongoose";

export type RoadmapLessonType =
  | "grammar"
  | "vocabulary"
  | "ipa"
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "review";

export interface IRoadmapTopicLesson {
  type: RoadmapLessonType;
  lessonId: mongoose.Types.ObjectId;
  orderIndex: number;
}

export interface IRoadmapTopic extends Document {
  title: string;
  description?: string;
  icon?: string;
  lessons: IRoadmapTopicLesson[];
  isActive: boolean;
  orderIndex: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapTopicLessonSchema = new Schema<IRoadmapTopicLesson>(
  {
    type: {
      type: String,
      enum: ["grammar", "vocabulary", "ipa", "listening", "speaking", "reading", "writing", "review"],
      required: [true, "Loại bài học là bắt buộc"],
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      required: [true, "ID bài học là bắt buộc"],
    },
    orderIndex: {
      type: Number,
      required: [true, "Thứ tự bài học là bắt buộc"],
      min: [0, "Thứ tự bài học không được âm"],
    },
  },
  { _id: false }
);

const roadmapTopicSchema = new Schema<IRoadmapTopic>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề chủ đề là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "📚",
      trim: true,
    },
    lessons: {
      type: [roadmapTopicLessonSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
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

roadmapTopicSchema.index({ title: "text", description: "text" });
roadmapTopicSchema.index({ isActive: 1, orderIndex: 1 });

export const RoadmapTopic = mongoose.model<IRoadmapTopic>("RoadmapTopic", roadmapTopicSchema);

