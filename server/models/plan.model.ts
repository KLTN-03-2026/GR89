import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IPlan extends Document {
  name: string; // Display name: "Basic", "Pro"
  description?: string; // Mô tả gói
  price: number; // Giá gốc
  currency: string; // "VND", "USD"
  billingCycle: "monthly" | "yearly" | "lifetime"; // Chu kỳ thanh toán
  features: string[]; // Danh sách tính năng
  isActive: boolean; // Trạng thái hoạt động
  sortOrder: number; // Thứ tự hiển thị
  displayType: "default" | "vip" | "premium"; // Loại hiển thị (client có nhiều loại UI khác nhau)
  // Promotion fields (optional)
  originalPrice?: number; // Giá gốc (nếu đang có khuyến mãi)
  discountPercent?: number; // Phần trăm giảm giá
  validFrom?: Date; // Ngày bắt đầu khuyến mãi
  validTo?: Date; // Ngày kết thúc khuyến mãi
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for pagination result
export interface IPlanPaginateResult {
  docs: IPlan[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  next?: number;
  prev?: number;
  pagingCounter: number;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, "Tên gói là bắt buộc"],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Giá là bắt buộc"],
      min: [0, "Giá phải lớn hơn hoặc bằng 0"],
    },
    currency: {
      type: String,
      required: [true, "Tiền tệ là bắt buộc"],
      default: "VND",
      trim: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      required: [true, "Chu kỳ thanh toán là bắt buộc"],
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    displayType: {
      type: String,
      enum: ["default", "vip", "premium"],
      default: "default",
    },
    originalPrice: {
      type: Number,
      min: [0, "Giá gốc phải lớn hơn hoặc bằng 0"],
    },
    discountPercent: {
      type: Number,
      min: [0, "Phần trăm giảm giá phải lớn hơn hoặc bằng 0"],
      max: [100, "Phần trăm giảm giá không được vượt quá 100"],
    },
    validFrom: {
      type: Date,
    },
    validTo: {
      type: Date,
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

// Indexes
planSchema.index({ isActive: 1 });
planSchema.index({ displayType: 1 });
planSchema.index({ billingCycle: 1 });
planSchema.index({ sortOrder: 1 });
planSchema.index({ name: "text", description: "text" });

// Add pagination plugin
planSchema.plugin(mongoosePaginate);

export interface IPlanModel extends mongoose.Model<IPlan> {
  paginate(query?: any, options?: any): Promise<IPlanPaginateResult>;
}

export const Plan = mongoose.model<IPlan, IPlanModel>("Plan", planSchema);

