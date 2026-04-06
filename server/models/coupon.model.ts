import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ICoupon extends Document {
  code: string; // Mã giảm giá: "SUMMER2024", "WELCOME10"
  name: string; // Tên mã giảm giá
  description?: string; // Mô tả
  discountType: "percentage" | "fixed"; // Loại giảm giá: phần trăm hoặc số tiền cố định
  discountValue: number; // Giá trị giảm giá (phần trăm hoặc số tiền)
  minPurchaseAmount?: number; // Số tiền tối thiểu để áp dụng
  maxDiscountAmount?: number; // Số tiền giảm tối đa (cho loại percentage)
  validFrom: Date; // Ngày bắt đầu
  validTo: Date; // Ngày kết thúc
  usageLimit?: number; // Số lần sử dụng tối đa (null = không giới hạn)
  usedCount: number; // Số lần đã sử dụng
  isActive: boolean; // Trạng thái hoạt động
  applicablePlans?: mongoose.Types.ObjectId[]; // Danh sách Plan._id có thể áp dụng (empty = áp dụng cho tất cả)
  isFirstTimeOnly: boolean; // Chỉ áp dụng cho lần đầu tiên
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for pagination result
export interface ICouponPaginateResult {
  coupons: ICoupon[];
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

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Mã giảm giá là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Tên mã giảm giá là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Loại giảm giá là bắt buộc"],
    },
    discountValue: {
      type: Number,
      required: [true, "Giá trị giảm giá là bắt buộc"],
      min: [0, "Giá trị giảm giá phải lớn hơn hoặc bằng 0"],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, "Số tiền tối thiểu phải lớn hơn hoặc bằng 0"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Số tiền giảm tối đa phải lớn hơn hoặc bằng 0"],
    },
    validFrom: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    validTo: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },
    usageLimit: {
      type: Number,
      min: [1, "Số lần sử dụng tối đa phải lớn hơn 0"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Số lần đã sử dụng phải lớn hơn hoặc bằng 0"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicablePlans: {
      type: [Schema.Types.ObjectId],
      ref: "Plan",
      default: [],
    },
    isFirstTimeOnly: {
      type: Boolean,
      default: false,
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
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });
couponSchema.index({ name: "text", description: "text", code: "text" });

// Validation: validTo must be after validFrom
couponSchema.pre("validate", function (next) {
  if (this.validTo && this.validFrom && this.validTo < this.validFrom) {
    next(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
  } else {
    next();
  }
});

// Validation: percentage discount should be between 0-100
couponSchema.pre("validate", function (next) {
  if (this.discountType === "percentage" && (this.discountValue < 0 || this.discountValue > 100)) {
    next(new Error("Phần trăm giảm giá phải từ 0 đến 100"));
  } else {
    next();
  }
});

// Add pagination plugin
couponSchema.plugin(mongoosePaginate);

export interface ICouponModel extends mongoose.Model<ICoupon> {
  paginate(query?: any, options?: any): Promise<ICouponPaginateResult>;
}

export const Coupon = mongoose.model<ICoupon, ICouponModel>("Coupon", couponSchema);

