import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { PlanService, IOptions } from "../services/plan.service";
import ErrorHandler from "../utils/ErrorHandler";
import path from "path";
import fs from "fs";

export class PlanController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách gói dịch vụ ra file Excel
  static exportPlanData = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const buffer = await PlanService.exportPlanData();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="plans.xlsx"');
    res.status(200).send(buffer);
  });

  // (ADMIN) Import danh sách gói dịch vụ từ file Excel
  static importPlanData = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id as string;
      if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

      const file = (req as any).file;
      if (!file) return next(new ErrorHandler("Vui lòng tải lên file Excel", 400));

      const skipErrors = String(req.body.skipErrors || "false") === "true";
      const filePath = path.resolve(file.path);
      const result = await PlanService.importPlanData(filePath, userId, skipErrors);

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

  // (ADMIN) Lấy danh sách gói dịch vụ (có phân trang & tìm kiếm)
  static getAllPlans = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, sortBy, sortOrder, isActive, displayType, billingCycle, createdBy } =
      req.query;
    const options: IOptions = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      isActive: isActive ? isActive === "true" : undefined,
      displayType: displayType as "default" | "vip" | "premium",
      billingCycle: billingCycle as "monthly" | "yearly" | "lifetime",
      createdBy: createdBy as string,
    };
    const result = await PlanService.getAllPlansPaginated(options);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách gói dịch vụ thành công",
      data: (result as any).plans || result.docs || [],
      pagination: {
        page: result.page,
        limit: result.limit,
        total: (result as any).total || result.totalDocs || 0,
        pages: (result as any).pages || result.totalPages || 0,
        hasNext: result.hasNext,
        next: result.next,
        prev: result.prev
      },
    });
  });

  // (ADMIN) Cập nhật trạng thái cho nhiều gói dịch vụ
  static updateManyPlansStatus = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ids, isActive } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("Danh sách ID gói trống", 400));
      }
      if (typeof isActive !== "boolean") {
        return next(new ErrorHandler("Trạng thái phải là giá trị boolean", 400));
      }
      const result = await PlanService.updateManyPlansStatus(ids, isActive);
      res.status(200).json({
        success: true,
        message: `Đã cập nhật trạng thái cho ${result.updatedCount} gói dịch vụ thành công`,
        data: result,
      });
    }
  );

  // (ADMIN) Xóa nhiều gói dịch vụ
  static deleteManyPlans = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("Danh sách ID gói trống", 400));
      }
      const result = await PlanService.deleteManyPlans(ids);
      res.status(200).json({
        success: true,
        message: `Đã xóa ${result.deletedCount} gói dịch vụ thành công`,
        data: result,
      });
    }
  );

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách gói dịch vụ đang hoạt động
  static getActivePlans = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { displayType } = req.query;
      const plans = await PlanService.getActivePlans(
        displayType as "default" | "vip" | "premium"
      );
      res.status(200).json({
        success: true,
        message: "Lấy danh sách gói dịch vụ thành công",
        data: plans,
      });
    }
  );

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết gói dịch vụ theo ID
  static getPlanById = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const plan = await PlanService.getPlanById(id);
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết gói dịch vụ thành công",
      data: plan,
    });
  });

  // (ADMIN) Tạo gói dịch vụ mới
  static createPlan = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

    const {
      name,
      description,
      price,
      originalPrice,
      currency,
      billingCycle,
      features,
      displayType,
      discountPercent,
      validFrom,
      validTo,
    } = req.body;

    if (!name || originalPrice === undefined || !billingCycle) {
      return next(new ErrorHandler("Vui lòng nhập đầy đủ thông tin (tên gói, giá gốc, chu kỳ)", 400));
    }

    let finalPrice = price;
    if (finalPrice === undefined || finalPrice === null) {
      finalPrice = Number(originalPrice);
      if (discountPercent && discountPercent > 0) {
        finalPrice = finalPrice * (1 - discountPercent / 100);
      }
    }

    const plan = await PlanService.createPlan({
      name,
      description,
      price: finalPrice,
      currency: "VND",
      isActive: false,
      sortOrder: 0,
      billingCycle,
      features: features || [],
      displayType: displayType || "default",
      originalPrice: Number(originalPrice),
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: validTo ? new Date(validTo) : undefined,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo gói dịch vụ thành công",
      data: plan,
    });
  });

  // (ADMIN) Cập nhật gói dịch vụ
  static updatePlan = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

    const { id } = req.params;
    const {
      price,
      originalPrice,
      discountPercent,
      validFrom,
      validTo,
      ...updateData
    } = req.body;

    if (originalPrice !== undefined) {
      let finalPrice = Number(originalPrice);
      if (discountPercent && discountPercent > 0) {
        finalPrice = finalPrice * (1 - discountPercent / 100);
      }
      updateData.price = finalPrice;
      updateData.originalPrice = Number(originalPrice);
      updateData.discountPercent = discountPercent ? Number(discountPercent) : undefined;
    } else if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validTo) updateData.validTo = new Date(validTo);

    updateData.currency = "VND";
    updateData.updatedBy = userId;

    const plan = await PlanService.updatePlan(id, updateData);
    res.status(200).json({
      success: true,
      message: "Cập nhật gói dịch vụ thành công",
      data: plan,
    });
  });

  // (ADMIN) Xóa gói dịch vụ
  static deletePlan = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const plan = await PlanService.deletePlan(id);
    res.status(200).json({
      success: true,
      message: "Xóa gói dịch vụ thành công",
      data: plan,
    });
  });

  // (ADMIN) Bật/tắt trạng thái hoạt động của gói dịch vụ
  static updatePlanStatus = CatchAsyncError(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const plan = await PlanService.updatePlanStatus(id);
      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái gói dịch vụ thành công",
        data: plan,
      });
    }
  );
}
