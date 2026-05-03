import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { PaymentService, IPaymentOptions } from "../services/payment.service";
import ErrorHandler from "../utils/ErrorHandler";
import { Payment } from "../models/payment.model";

export class PaymentController {
  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách giao dịch (có phân trang & tìm kiếm)
  static getAllPayments = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
        provider,
        userId,
        planId,
        startDate,
        endDate,
      } = req.query;

      const options: IPaymentOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        status: status as any,
        provider: provider as any,
        userId: userId as string,
        planId: planId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await PaymentService.getAllPaymentsPaginated(options);

      const paidCount = await Payment.countDocuments({ status: "paid" });
      const totalRevenue = await Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      res.status(200).json({
        success: true,
        message: "Lấy danh sách giao dịch thành công",
        data: result.payments,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
          next: result.next,
          prev: result.prev,
        },
        paidCount,
        totalRevenue: totalRevenue[0]?.total || 0,
      });
    }
  );

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy lịch sử giao dịch của người dùng hiện tại
  static getUserPayments = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const payments = await PaymentService.getUserPayments(userId);
      res.status(200).json({
        success: true,
        message: "Lấy danh sách giao dịch thành công",
        data: payments,
      });
    }
  );

  // (USER) Tạo link thanh toán VNPay (QR Code)
  static createPaymentUrl = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      const { planId, couponCode } = req.body;

      if (!planId) {
        return next(new ErrorHandler("Vui lòng lựa chọn gói khóa học", 400));
      }

      const result = await PaymentService.createQRPayment({
        userId,
        planId,
        couponCode: couponCode || undefined,
      });

      res.status(201).json({
        success: true,
        message: "Tạo link thanh toán thành công",
        data: result,
      });
    }
  );

  static payOSWebhook = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body

    const result = await PaymentService.payOSWebhook(payload)
    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
      date: result
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết giao dịch theo ID
  static getPaymentById = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const payment = await PaymentService.getPaymentById(id);
      res.status(200).json({
        success: true,
        message: "Lấy thông tin giao dịch thành công",
        data: payment,
      });
    }
  );
}
