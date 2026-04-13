import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId; // Reference to Plan._id
  amount: number; // Số tiền thanh toán (sau giảm giá nếu có)
  provider: "vnpay" | "momo" | "stripe" | "paypal"; // Cổng thanh toán
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentDate?: Date; // Ngày thanh toán thành công
  couponId?: mongoose.Types.ObjectId; // Mã giảm giá đã sử dụng (nếu có)
  discountAmount?: number; // Số tiền được giảm từ coupon
  createdAt: Date;
  updatedAt: Date;
}

// Interface for pagination result
// Note: customLabels trong payment.service.ts map:
// - totalDocs -> total
// - totalPages -> pages
export interface IPaymentPaginateResult {
  payments: IPayment[];
  total: number; // mapped from totalDocs
  limit: number;
  page: number;
  pages: number; // mapped from totalPages
  hasNext: boolean;
  hasPrev: boolean;
  next?: number;
  prev?: number;
  pagingCounter: number;
  paidCount: number;
  totalRevenue: number;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người dùng là bắt buộc"],
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "Mã gói là bắt buộc"],
    },
    amount: {
      type: Number,
      required: [true, "Số tiền là bắt buộc"],
      min: [0, "Số tiền phải lớn hơn hoặc bằng 0"],
    },
    provider: {
      type: String,
      enum: ["vnpay", "momo", "stripe", "paypal"],
      required: [true, "Cổng thanh toán là bắt buộc"],
      default: "vnpay",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Số tiền giảm phải lớn hơn hoặc bằng 0"],
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ planId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ createdAt: -1 });

// Add pagination plugin
paymentSchema.plugin(mongoosePaginate);

export interface IPaymentModel extends mongoose.Model<IPayment> {
  paginate(query?: any, options?: any): Promise<IPaymentPaginateResult>;
}

export const Payment = mongoose.model<IPayment, IPaymentModel>("Payment", paymentSchema);

