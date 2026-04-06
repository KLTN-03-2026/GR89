import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { CouponService, ICouponOptions } from "../services/coupon.service";
import ErrorHandler from "../utils/ErrorHandler";
import path from "path";
import fs from "fs";

export class CouponController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách mã giảm giá ra file Excel
  static exportCouponData = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const buffer = await CouponService.exportCouponData();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="coupons.xlsx"');
    res.status(200).send(buffer);
  });

  // (ADMIN) Import danh sách mã giảm giá từ file Excel
  static importCouponData = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const file = (req as any).file;
      if (!file) return next(new ErrorHandler("Vui lòng tải lên file Excel", 400));

      const skipErrors = String(req.body.skipErrors || "false") === "true";
      const filePath = path.resolve(file.path);
      const result = await CouponService.importCouponData(filePath, userId, skipErrors);

      try {
        fs.unlinkSync(filePath);
      } catch { }

      res.status(200).json({
        success: true,
        message: `Import hoàn tất. Tạo mới: ${result.created}, Cập nhật: ${result.updated}, Lỗi: ${result.errors.length}`,
        data: result,
      });
    }
  );

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách mã giảm giá (có phân trang & tìm kiếm)
  static getAllCoupons = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { page, limit, search, sortBy, sortOrder, isActive, createdBy } = req.query;
      const options: ICouponOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        isActive: isActive ? isActive === "true" : undefined,
        createdBy: createdBy as string,
      };
      const result = await CouponService.getAllCouponsPaginated(options);
      res.status(200).json({
        success: true,
        message: "Lấy danh sách mã giảm giá thành công",
        data: result.coupons,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
          next: result.next,
          prev: result.prev,
        },
      });
    }
  );

  // (ADMIN) Cập nhật trạng thái cho nhiều mã giảm giá
  static updateManyCouponsStatus = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ids, isActive } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("Danh sách ID mã giảm giá trống", 400));
      }
      if (typeof isActive !== "boolean") {
        return next(new ErrorHandler("Trạng thái phải là giá trị boolean", 400));
      }
      const result = await CouponService.updateManyCouponsStatus(ids, isActive);
      res.status(200).json({
        success: true,
        message: `Đã cập nhật trạng thái cho ${result.updatedCount} mã giảm giá thành công`,
        data: result,
      });
    }
  );

  // (ADMIN) Xóa nhiều mã giảm giá
  static deleteManyCoupons = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("Danh sách ID mã giảm giá trống", 400));
      }
      const result = await CouponService.deleteManyCoupons(ids);
      res.status(200).json({
        success: true,
        message: `Đã xóa ${result.deletedCount} mã giảm giá thành công`,
        data: result,
      });
    }
  );

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Kiểm tra tính hợp lệ của mã giảm giá
  static validateCoupon = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { code, planId, amount } = req.query;
      const userId = req.user?._id as string;

      if (!code) {
        return next(new ErrorHandler("Vui lòng nhập mã giảm giá", 400));
      }

      const coupon = await CouponService.getCouponByCode(
        code as string,
        userId,
        planId as string,
        amount ? Number(amount) : undefined
      );

      const discountAmount = CouponService.calculateDiscount(
        coupon,
        amount ? Number(amount) : 0
      );

      res.status(200).json({
        success: true,
        message: "Mã giảm giá hợp lệ",
        data: {
          coupon: {
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          },
          discountAmount,
          finalAmount: amount ? Number(amount) - discountAmount : 0,
        },
      });
    }
  );

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết mã giảm giá theo ID
  static getCouponById = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const coupon = await CouponService.getCouponById(id);
      res.status(200).json({
        success: true,
        message: "Lấy chi tiết mã giảm giá thành công",
        data: coupon,
      });
    }
  );

  // (ADMIN) Tạo mã giảm giá mới
  static createCoupon = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const {
        code,
        name,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        validFrom,
        validTo,
        usageLimit,
        isActive,
        applicablePlans,
        isFirstTimeOnly,
      } = req.body;

      if (!code || !name || !discountType || discountValue === undefined || !validFrom || !validTo) {
        return next(new ErrorHandler("Vui lòng nhập đầy đủ thông tin", 400));
      }

      const coupon = await CouponService.createCoupon({
        code,
        name,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        usageLimit,
        isActive: isActive !== undefined ? isActive : true,
        applicablePlans: applicablePlans || [],
        isFirstTimeOnly: isFirstTimeOnly || false,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        message: "Tạo mã giảm giá thành công",
        data: coupon,
      });
    }
  );

  // (ADMIN) Cập nhật thông tin mã giảm giá
  static updateCoupon = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const { id } = req.params;
      const updateData = req.body;

      if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
      if (updateData.validTo) updateData.validTo = new Date(updateData.validTo);

      updateData.updatedBy = userId;

      const coupon = await CouponService.updateCoupon(id, updateData);
      res.status(200).json({
        success: true,
        message: "Cập nhật mã giảm giá thành công",
        data: coupon,
      });
    }
  );

  // (ADMIN) Xóa mã giảm giá
  static deleteCoupon = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const coupon = await CouponService.deleteCoupon(id);
      res.status(200).json({
        success: true,
        message: "Xóa mã giảm giá thành công",
        data: coupon,
      });
    }
  );

  // (ADMIN) Bật/tắt trạng thái mã giảm giá
  static updateCouponStatus = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const coupon = await CouponService.updateCouponStatus(id);
      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái mã giảm giá thành công",
        data: coupon,
      });
    }
  );
}

