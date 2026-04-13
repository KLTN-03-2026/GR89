import mongoose from "mongoose";
import { IPayment, IPaymentPaginateResult, Payment } from "../models/payment.model";
import ErrorHandler from "../utils/ErrorHandler";
import { dateFormat, HashAlgorithm, ignoreLogger, ProductCode, VNPay, VnpLocale } from "vnpay";
import { Plan } from "../models/plan.model";
import { CouponService } from "./coupon.service";
import { UserInfo } from "./auth.service";
import { User } from "../models/user.model";

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

  // (VNPay) Xử lý callback từ VNPay sau khi người dùng thanh toán
  static async handleVNPayCallback(params: any): Promise<{
    success: boolean;
    paymentId?: string;
    message: string;
  }> {
    const {
      vnp_ResponseCode,
      vnp_TxnRef,
      vnp_TransactionStatus,
      vnp_SecureHash,
      ...vnpayParams
    } = params;

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE || "",
      secureSecret: process.env.VNPAY_HASH_SECRET || "",
      vnpayHost: process.env.VNPAY_URL || "",
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });

    const isValid = vnpay.verifyReturnUrl(params);
    if (!isValid) {
      return { success: false, message: "Chữ ký không hợp lệ" };
    }

    const paymentId = vnp_TxnRef;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return { success: false, message: "Không tìm thấy giao dịch" };
    }

    if (payment.status !== "pending") {
      return {
        success: payment.status === "paid",
        paymentId,
        message: "Giao dịch đã được xử lý trước đó",
      };
    }

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      payment.status = "paid";
      payment.paymentDate = new Date();
      await payment.save();

      if (payment.couponId) {
        await CouponService.incrementCouponUsage(String(payment.couponId));
      }

      await this.syncVipStatus(String(payment.userId), String(payment.planId));

      return { success: true, paymentId, message: "Thanh toán thành công" };
    } else {
      payment.status = "failed";
      await payment.save();
      return { success: false, paymentId, message: "Thanh toán thất bại hoặc bị hủy" };
    }
  }

  // Helper đồng bộ trạng thái VIP cho người dùng sau khi thanh toán thành công
  private static async syncVipStatus(userId: string, planId: string): Promise<void> {
    const plan = await Plan.findById(planId);
    if (!plan) return;

    let durationDays = 0;
    switch (plan.billingCycle) {
      case "monthly":
        durationDays = 30;
        break;
      case "yearly":
        durationDays = 365;
        break;
      case "lifetime":
        durationDays = 36500; // ~100 years
        break;
    }

    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    let startDate = now;

    if (user.isVip && user.vipStartDate && user.vipStartDate > now) {
      startDate = user.vipStartDate;
    }

    user.isVip = true;
    user.vipPlanId = new mongoose.Types.ObjectId(planId);
    user.vipStartDate = user.vipStartDate || now;

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

  // (USER) Tạo link thanh toán VNPay (QR Code)
  static async createQRPayment(params: {
    planId: string;
    userId?: string;
    ipAddr?: string;
    returnUrl?: string;
    couponCode?: string;
  }): Promise<{ paymentUrl: string; paymentId: string }> {
    const {
      planId,
      userId,
      ipAddr = "127.0.0.1",
      returnUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/callback`,
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

    const newPayment = await Payment.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      amount: finalAmount,
      provider: "vnpay",
      status: "pending",
      couponId,
      discountAmount,
    });

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE || "",
      secureSecret: process.env.VNPAY_HASH_SECRET || "",
      vnpayHost: process.env.VNPAY_URL || "",
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });

    const createDate = new Date();
    const expireDate = new Date(Date.now() + 10 * 60 * 1000);
    const vnpAmount = Math.round(finalAmount);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: vnpAmount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: String(newPayment._id),
      vnp_OrderInfo: `Thanh toán gói ${plan.name}${discountAmount > 0 ? ` - Giảm ${discountAmount.toLocaleString("vi-VN")}đ` : ""
        } - ${finalAmount.toLocaleString("vi-VN")}đ`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(formatVNPayDate(createDate)),
      vnp_ExpireDate: Number(formatVNPayDate(expireDate)),
    });

    const paymentUrl =
      typeof vnpayResponse === "string" ? vnpayResponse : (vnpayResponse as any).url;

    return { paymentUrl, paymentId: String(newPayment._id) };
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

