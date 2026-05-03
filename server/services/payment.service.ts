import mongoose from "mongoose";
import { IPayment, IPaymentPaginateResult, Payment } from "../models/payment.model";
import ErrorHandler from "../utils/ErrorHandler";
import { IPlan, Plan } from "../models/plan.model";
import { CouponService } from "./coupon.service";
import { User } from "../models/user.model";
import { payOSProvider } from "../providers/payOS.provider";

export interface IPaymentData {
  userId: string;
  planId: mongoose.Types.ObjectId | string;
  amount: number;
  provider: "vnpay" | "momo" | "stripe" | "paypal";
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentDate?: Date;
  couponId?: mongoose.Types.ObjectId;
  discountAmount?: number;
}

export interface IPaymentOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  provider?: "vnpay" | "momo" | "stripe" | "paypal";
  userId?: string;
  planId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Helper function để format date theo định dạng VNPay
const formatVNPayDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export class PaymentService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // Helper Lấy thời gian của gói vip
  private static async getTimePlan(plan: IPlan): Promise<number> {
    switch (plan.billingCycle) {
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      case 'yearly':
        return 365 * 24 * 60 * 60 * 1000;
      case 'lifetime':
        return 1000 * 365 * 24 * 60 * 60 * 1000
      default:
        return 0
    }
  }

  // Helper đồng bộ trạng thái VIP cho người dùng sau khi thanh toán thành công
  private static async syncVipStatus(userId: string, planId: string): Promise<void> {
    const plan = await Plan.findById(planId);
    if (!plan) return;

    const user = await User.findById(userId);
    if (!user) return;

    const timePlan = await this.getTimePlan(plan)

    const now = new Date();
    if (user.vipExpireDate && user.vipExpireDate > now) {
      user.vipExpireDate = new Date(user.vipExpireDate.getTime() + timePlan);
    } else {
      user.vipStartDate = now;
      user.vipExpireDate = new Date(now.getTime() + timePlan);
    }


    await user.save();
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách giao dịch (có phân trang & tìm kiếm)
  static async getAllPaymentsPaginated(options: IPaymentOptions): Promise<IPaymentPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      provider,
      userId,
      planId,
      startDate,
      endDate,
    } = options;

    const query: any = {};

    if (search && mongoose.Types.ObjectId.isValid(search)) {
      query._id = new mongoose.Types.ObjectId(search);
    }

    if (status) {
      query.status = status;
    }

    if (provider) {
      query.provider = provider;
    }

    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (planId) {
      query.planId = new mongoose.Types.ObjectId(planId);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        {
          path: "userId",
          select: "fullName email",
        },
        {
          path: "couponId",
          select: "code name",
        },
      ],
      lean: false,
      customLabels: {
        docs: "payments",
        totalDocs: "total",
        limit: "limit",
        page: "page",
        totalPages: "pages",
        hasNextPage: "hasNext",
        hasPrevPage: "hasPrev",
        nextPage: "next",
        prevPage: "prev",
      },
    };

    return await (Payment as any).paginate(query, paginateOptions);
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy lịch sử giao dịch của người dùng hiện tại
  static async getUserPayments(userId: string): Promise<IPayment[]> {
    const payments = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate("couponId", "code name");
    return payments;
  }

  // (USER) Tạo link thanh toán PayOS (QR Code)
  static async createQRPayment(params: {
    planId: string;
    userId: string;
    couponCode?: string;
  }): Promise<{ paymentUrl: string; paymentId: string }> {
    const {
      planId,
      userId,
      couponCode,
    } = params;

    const plan = await Plan.findById(planId);
    if (!plan) throw new ErrorHandler("Gói khóa học không tồn tại", 404);

    let couponId: mongoose.Types.ObjectId | undefined = undefined;
    let discountAmount = 0;
    let finalAmount = plan.price;

    if (couponCode) {
      const coupon = await CouponService.getCouponByCode(couponCode, userId, planId, plan.price);
      discountAmount = CouponService.calculateDiscount(coupon, plan.price);
      finalAmount = Math.max(0, plan.price - discountAmount);
      couponId = coupon._id as mongoose.Types.ObjectId;
    }
    const orderCode = Date.now() + Math.floor(Math.random() * 1000);

    const newPayment = await Payment.create({
      userId: userId,
      planId: plan._id,
      amount: finalAmount,
      provider: "payos",
      status: "pending",
      couponId,
      discountAmount,
      orderCode: orderCode,
    });

    if (finalAmount > 0) {
      const paymentData = {
        orderCode: newPayment.orderCode,
        amount: Math.round(finalAmount),
        description: `Thanh toán gói ${plan.name}`,
        items: [
          {
            name: `${plan.name} - ${finalAmount.toLocaleString('vi-VN')} VND`,
            quantity: 1,
            price: finalAmount,
          },
        ],
        cancelUrl: `${process.env.CLIENT_BASE_URL}/payment/cancel`,
        returnUrl: `${process.env.CLIENT_BASE_URL}/payment/success`,
      };
      const paymentLink = await payOSProvider.paymentRequests.create(paymentData);

      return { paymentUrl: paymentLink.checkoutUrl, paymentId: String(newPayment._id) };
    }
    else {
      // Cập nhật trạng thái thanh toán
      newPayment.status = 'paid'
      await newPayment.save();

      // Thêm lượt sử dụng coupon nếu có
      const coupon = await CouponService.getCouponById(newPayment.couponId?.toString() || "");
      if (coupon) {
        coupon.usedCount = coupon.usedCount + 1;
        await coupon.save();
      }

      await this.syncVipStatus(userId, planId)
      return { paymentUrl: `${process.env.CLIENT_BASE_URL}/payment/success`, paymentId: String(newPayment._id) };
    }
  }

  static async payOSWebhook(payload: any): Promise<void> {
    const isValid = payOSProvider.webhooks.verify(payload);
    if (!isValid) throw new ErrorHandler("Webhook không hợp lệ", 400);
    const { orderCode } = payload;
    const payment = await Payment.findOne({ orderCode });
    if (!payment) throw new ErrorHandler("Giao dịch không tồn tại", 404);

    if (payload.data.code === "00" && payload.code === "00") {
      payment.status = "paid";
      payment.paymentDate = new Date();
      await payment.save();
      await this.syncVipStatus(payment.userId.toString(), payment.planId.toString());
      const coupon = await CouponService.getCouponById(payment.couponId?.toString() || "");
      if (coupon) {
        coupon.usedCount = coupon.usedCount + 1;
        await coupon.save();
      }
    }
    else {
      payment.status = "failed";
      await payment.save();
    }
  }



  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết giao dịch theo ID
  static async getPaymentById(paymentId: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId)
      .populate("userId", "fullName email")
      .populate("couponId", "code name")
      .populate("createdBy", "fullName email");

    if (!payment) throw new ErrorHandler("Giao dịch không tồn tại", 404);
    return payment;
  }
}

