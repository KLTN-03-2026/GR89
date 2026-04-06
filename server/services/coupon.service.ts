import mongoose from "mongoose";
import { ICoupon, ICouponPaginateResult, Coupon } from "../models/coupon.model";
import ErrorHandler from "../utils/ErrorHandler";
import XLSX from "xlsx";
import { Payment } from "../models/payment.model";

export interface ICouponData {
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  isActive: boolean;
  applicablePlans?: string[];
  isFirstTimeOnly: boolean;
  createdBy: string;
  updatedBy?: string;
}

export interface ICouponOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  createdBy?: string;
}

export class CouponService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách mã giảm giá ra file Excel
  static async exportCouponData(): Promise<Buffer> {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).populate("createdBy", "fullName email");

    const data = [
      [
        "_id",
        "code",
        "name",
        "description",
        "discountType",
        "discountValue",
        "minPurchaseAmount",
        "maxDiscountAmount",
        "validFrom",
        "validTo",
        "usageLimit",
        "usedCount",
        "isActive",
        "isFirstTimeOnly",
        "applicablePlans",
        "createdBy",
      ],
    ];

    coupons.forEach((coupon) => {
      data.push([
        String(coupon._id),
        coupon.code,
        coupon.name,
        coupon.description || "",
        coupon.discountType,
        coupon.discountValue,
        coupon.minPurchaseAmount || 0,
        coupon.maxDiscountAmount || 0,
        coupon.validFrom ? coupon.validFrom.toISOString() : "",
        coupon.validTo ? coupon.validTo.toISOString() : "",
        coupon.usageLimit || 0,
        coupon.usedCount || 0,
        coupon.isActive ? "true" : "false",
        coupon.isFirstTimeOnly ? "true" : "false",
        (coupon.applicablePlans || []).join(", "),
        (coupon.createdBy as any)?.fullName || "",
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Coupons");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  // (ADMIN) Import danh sách mã giảm giá từ file Excel
  static async importCouponData(
    filePath: string,
    userId: string,
    skipErrors: boolean = false
  ): Promise<{
    created: number;
    updated: number;
    errors: Array<{ row: number; reason: string }>;
    total: number;
  }> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new ErrorHandler("File Excel không hợp lệ", 400);
    }

    const couponsData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ row: number; reason: string }>,
      total: couponsData.length - 1,
    };

    for (let i = 1; i < couponsData.length; i++) {
      const row = couponsData[i] as any[];
      if (!row || row.length < 9) continue;

      try {
        const [
          codeRaw,
          nameRaw,
          descriptionRaw,
          discountTypeRaw,
          discountValueRaw,
          minPurchaseAmountRaw,
          maxDiscountAmountRaw,
          validFromRaw,
          validToRaw,
          usageLimitRaw,
          isActiveRaw,
          applicablePlansRaw,
          isFirstTimeOnlyRaw,
        ] = row;

        const code = String(codeRaw || "").trim().toUpperCase();
        const name = String(nameRaw || "").trim();
        const description = String(descriptionRaw || "").trim();
        const discountType = String(discountTypeRaw || "percentage").trim() as "percentage" | "fixed";
        const discountValue = Number(discountValueRaw || 0);
        const minPurchaseAmount = minPurchaseAmountRaw ? Number(minPurchaseAmountRaw) : undefined;
        const maxDiscountAmount = maxDiscountAmountRaw ? Number(maxDiscountAmountRaw) : undefined;
        const validFrom = new Date(validFromRaw);
        const validTo = new Date(validToRaw);
        const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : undefined;
        const isActive = String(isActiveRaw || "true").toLowerCase() === "true";
        const applicablePlans = String(applicablePlansRaw || "")
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const isFirstTimeOnly = String(isFirstTimeOnlyRaw || "false").toLowerCase() === "true";

        if (!code || !name || discountValue <= 0) {
          const errorMsg = "Thiếu thông tin bắt buộc (mã, tên, giá trị giảm)";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        if (!["percentage", "fixed"].includes(discountType)) {
          const errorMsg = "Loại giảm giá không hợp lệ (phải là percentage hoặc fixed)";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
          const errorMsg = "Phần trăm giảm giá phải từ 0 đến 100";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        if (validTo < validFrom) {
          const errorMsg = "Ngày kết thúc phải sau ngày bắt đầu";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        const existing = await Coupon.findOne({ code });
        if (existing) {
          existing.name = name;
          existing.description = description;
          existing.discountType = discountType;
          existing.discountValue = discountValue;
          existing.minPurchaseAmount = minPurchaseAmount;
          existing.maxDiscountAmount = maxDiscountAmount;
          existing.validFrom = validFrom;
          existing.validTo = validTo;
          existing.usageLimit = usageLimit;
          existing.isActive = isActive;
          existing.isFirstTimeOnly = isFirstTimeOnly;
          existing.updatedBy = new mongoose.Types.ObjectId(userId);
          await existing.save();
          results.updated++;
        } else {
          await Coupon.create({
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
            isActive: false,
            isFirstTimeOnly,
            applicablePlans: applicablePlans || [],
            createdBy: new mongoose.Types.ObjectId(userId),
          });
          results.created++;
        }
      } catch (err: any) {
        if (skipErrors) {
          results.errors.push({
            row: i + 1,
            reason: err?.message || `Lỗi không xác định`,
          });
          continue;
        }
        throw err;
      }
    }

    return results;
  }

  // Tính số tiền giảm giá
  static calculateDiscount(coupon: ICoupon, amount: number): number {
    if (coupon.discountType === "percentage") {
      const discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        return Math.min(discount, coupon.maxDiscountAmount);
      }
      return discount;
    } else {
      return Math.min(coupon.discountValue, amount);
    }
  }

  // Tăng số lần sử dụng mã giảm giá
  static async incrementCouponUsage(couponId: string): Promise<void> {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách mã giảm giá (có phân trang & tìm kiếm)
  static async getAllCouponsPaginated(options: ICouponOptions): Promise<ICouponPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive,
      createdBy,
    } = options;

    const query: any = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        {
          path: "createdBy",
          select: "fullName email",
        },
        {
          path: "updatedBy",
          select: "fullName email",
        },
      ],
      lean: false,
      customLabels: {
        docs: "coupons",
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

    return await (Coupon as any).paginate(query, paginateOptions);
  }

  // (ADMIN) Cập nhật trạng thái cho nhiều mã giảm giá
  static async updateManyCouponsStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ updatedCount: number; updatedCoupons: ICoupon[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler("Danh sách ID mã giảm giá trống", 400);
    }

    const validIds = ids
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0 && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      throw new ErrorHandler("Không có ID hợp lệ", 400);
    }

    const coupons = await Coupon.find({ _id: { $in: validIds } });
    if (coupons.length !== validIds.length) {
      const foundIds = coupons.map((c) => String(c._id));
      const missingIds = validIds.filter((id) => !foundIds.includes(id));
      throw new ErrorHandler(
        `Không tìm thấy ${missingIds.length} mã giảm giá với ID: ${missingIds.join(", ")}`,
        404
      );
    }

    const result = await Coupon.updateMany({ _id: { $in: validIds } }, { $set: { isActive } });
    const updatedCoupons = await Coupon.find({ _id: { $in: validIds } });

    return {
      updatedCount: result.modifiedCount || 0,
      updatedCoupons: updatedCoupons as ICoupon[],
    };
  }

  // (ADMIN) Xóa nhiều mã giảm giá
  static async deleteManyCoupons(
    ids: string[]
  ): Promise<{ deletedCount: number; deletedCoupons: ICoupon[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler("Danh sách ID mã giảm giá trống", 400);
    }

    const validIds = ids
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0 && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      throw new ErrorHandler("Không có ID hợp lệ", 400);
    }

    const couponsToDelete = await Coupon.find({ _id: { $in: validIds } });
    if (couponsToDelete.length === 0) {
      throw new ErrorHandler("Không tìm thấy mã giảm giá nào để xóa", 404);
    }

    const result = await Coupon.deleteMany({ _id: { $in: validIds } });

    return {
      deletedCount: result.deletedCount || 0,
      deletedCoupons: couponsToDelete as ICoupon[],
    };
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Kiểm tra và lấy thông tin mã giảm giá theo code
  static async getCouponByCode(
    code: string,
    userId?: string,
    planId?: string,
    amount?: number
  ): Promise<ICoupon> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new ErrorHandler("Mã giảm giá không tồn tại hoặc đã bị tắt", 404);

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new ErrorHandler("Mã giảm giá chưa có hiệu lực", 400);
    }
    if (coupon.validTo && now > coupon.validTo) {
      throw new ErrorHandler("Mã giảm giá đã hết hạn", 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ErrorHandler("Mã giảm giá đã hết lượt sử dụng", 400);
    }

    if (
      coupon.applicablePlans &&
      coupon.applicablePlans.length > 0 &&
      planId &&
      !coupon.applicablePlans.some(p => String(p) === String(planId))
    ) {
      throw new ErrorHandler("Mã giảm giá không áp dụng cho gói này", 400);
    }

    if (coupon.minPurchaseAmount && amount && amount < coupon.minPurchaseAmount) {
      throw new ErrorHandler(
        `Đơn hàng phải có giá trị tối thiểu ${coupon.minPurchaseAmount.toLocaleString("vi-VN")}đ`,
        400
      );
    }

    if (coupon.isFirstTimeOnly && userId) {
      const hasPreviousPayment = await Payment.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        status: "paid"
      });

      if (hasPreviousPayment) {
        throw new ErrorHandler("Mã giảm giá chỉ áp dụng cho lần mua đầu tiên", 400);
      }
    }

    return coupon;
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết mã giảm giá theo ID
  static async getCouponById(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId)
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!coupon) throw new ErrorHandler("Mã giảm giá không tồn tại", 404);

    return coupon;
  }

  // (ADMIN) Tạo mã giảm giá mới
  static async createCoupon(couponData: ICouponData): Promise<ICoupon> {
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
      applicablePlans,
      isFirstTimeOnly,
      createdBy,
    } = couponData;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new ErrorHandler(`Mã giảm giá ${code} đã tồn tại`, 400);
    }

    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      throw new ErrorHandler("Phần trăm giảm giá phải từ 0 đến 100", 400);
    }

    if (validTo < validFrom) {
      throw new ErrorHandler("Ngày kết thúc phải sau ngày bắt đầu", 400);
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      validFrom,
      validTo,
      usageLimit,
      isActive: false,
      applicablePlans: applicablePlans || [],
      isFirstTimeOnly,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    return newCoupon;
  }

  // (ADMIN) Cập nhật mã giảm giá
  static async updateCoupon(couponId: string, couponData: Partial<ICouponData>): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new ErrorHandler("Mã giảm giá không tồn tại", 404);

    if (couponData.code && couponData.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: couponData.code.toUpperCase() });
      if (existingCoupon) {
        throw new ErrorHandler(`Mã giảm giá ${couponData.code} đã tồn tại`, 400);
      }
    }

    if (
      couponData.discountType === "percentage" &&
      (couponData.discountValue !== undefined &&
        (couponData.discountValue < 0 || couponData.discountValue > 100))
    ) {
      throw new ErrorHandler("Phần trăm giảm giá phải từ 0 đến 100", 400);
    }

    const validFrom = couponData.validFrom || coupon.validFrom;
    const validTo = couponData.validTo || coupon.validTo;
    if (validTo < validFrom) {
      throw new ErrorHandler("Ngày kết thúc phải sau ngày bắt đầu", 400);
    }

    Object.keys(couponData).forEach((key) => {
      if (key === "createdBy" || key === "updatedBy") {
        (coupon as any)[key] = new mongoose.Types.ObjectId((couponData as any)[key]);
      } else if (key === "code") {
        coupon.code = (couponData as any)[key].toUpperCase();
      } else {
        (coupon as any)[key] = (couponData as any)[key];
      }
    });

    if (couponData.updatedBy) {
      coupon.updatedBy = new mongoose.Types.ObjectId(couponData.updatedBy);
    }

    await coupon.save();
    return coupon;
  }

  // (ADMIN) Xóa mã giảm giá
  static async deleteCoupon(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new ErrorHandler("Mã giảm giá không tồn tại", 404);

    await Coupon.findByIdAndDelete(couponId);
    return coupon;
  }

  // (ADMIN) Bật/tắt trạng thái mã giảm giá
  static async updateCouponStatus(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new ErrorHandler("Mã giảm giá không tồn tại", 404);

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }
}

