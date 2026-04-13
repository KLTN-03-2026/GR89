import mongoose from "mongoose";
import { IPlan, IPlanPaginateResult, Plan } from "../models/plan.model";
import ErrorHandler from "../utils/ErrorHandler";
import XLSX from "xlsx";

export interface IPlanData {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "lifetime";
  features: string[];
  isActive: boolean;
  sortOrder: number;
  displayType: "default" | "vip" | "premium";
  originalPrice?: number;
  discountPercent?: number;
  validFrom?: Date;
  validTo?: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface IOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  displayType?: "default" | "vip" | "premium";
  billingCycle?: "monthly" | "yearly" | "lifetime";
  createdBy?: string;
}

export class PlanService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách gói dịch vụ ra file Excel
  static async exportPlanData(): Promise<Buffer> {
    const plans = await Plan.find().sort({ sortOrder: 1 }).populate("createdBy", "fullName email");

    const data = [
      [
        "_id",
        "name",
        "description",
        "price",
        "currency",
        "billingCycle",
        "features",
        "isActive",
        "sortOrder",
        "displayType",
        "originalPrice",
        "discountPercent",
        "validFrom",
        "validTo",
        "createdBy",
      ],
    ];

    plans.forEach((plan) => {
      data.push([
        String(plan._id),
        plan.name,
        plan.description || "",
        plan.price,
        plan.currency,
        plan.billingCycle,
        (plan.features || []).join(", "),
        plan.isActive ? "true" : "false",
        plan.sortOrder,
        plan.displayType,
        plan.originalPrice || 0,
        plan.discountPercent || 0,
        plan.validFrom ? plan.validFrom.toISOString() : "",
        plan.validTo ? plan.validTo.toISOString() : "",
        (plan.createdBy as any)?.fullName || "",
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plans");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách gói dịch vụ (có phân trang & tìm kiếm)
  static async getAllPlansPaginated(options: IOptions): Promise<IPlanPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "sortOrder",
      sortOrder = "asc",
      isActive,
      displayType,
      billingCycle,
      createdBy,
    } = options;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (displayType) {
      query.displayType = displayType;
    }

    if (billingCycle) {
      query.billingCycle = billingCycle;
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
        docs: "plans",
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

    return await (Plan as any).paginate(query, paginateOptions);
  }

  // (ADMIN) Cập nhật trạng thái cho nhiều gói dịch vụ
  static async updateManyPlansStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ updatedCount: number; updatedPlans: IPlan[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler("Danh sách ID gói trống", 400);
    }

    const validIds = ids
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0 && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      throw new ErrorHandler("Không có ID hợp lệ", 400);
    }

    const plans = await Plan.find({ _id: { $in: validIds } });
    if (plans.length !== validIds.length) {
      const foundIds = plans.map((p) => String(p._id));
      const missingIds = validIds.filter((id) => !foundIds.includes(id));
      throw new ErrorHandler(
        `Không tìm thấy ${missingIds.length} gói với ID: ${missingIds.join(", ")}`,
        404
      );
    }

    const result = await Plan.updateMany({ _id: { $in: validIds } }, { $set: { isActive } });
    const updatedPlans = await Plan.find({ _id: { $in: validIds } });

    return {
      updatedCount: result.modifiedCount || 0,
      updatedPlans: updatedPlans as IPlan[],
    };
  }

  // (ADMIN) Import danh sách gói dịch vụ từ file Excel
  static async importPlanData(
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

    const plansData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ row: number; reason: string }>,
      total: plansData.length - 1,
    };

    for (let i = 1; i < plansData.length; i++) {
      const row = plansData[i] as any[];
      if (!row || row.length < 5) continue;

      try {
        const [
          nameRaw,
          descriptionRaw,
          priceRaw,
          currencyRaw,
          billingCycleRaw,
          featuresRaw,
          isActiveRaw,
          sortOrderRaw,
          displayTypeRaw,
          originalPriceRaw,
          discountPercentRaw,
          validFromRaw,
          validToRaw,
        ] = row;

        const name = String(nameRaw || "").trim();
        const price = Number(priceRaw || 0);
        const currency = String(currencyRaw || "VND").trim();
        const billingCycle = String(billingCycleRaw || "monthly").trim() as
          | "monthly"
          | "yearly"
          | "lifetime";
        const features = String(featuresRaw || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
        const isActive = String(isActiveRaw || "true").toLowerCase() === "true";
        const sortOrder = Number(sortOrderRaw || 0);
        const displayType = (String(displayTypeRaw || "default").trim() ||
          "default") as "default" | "vip" | "premium";
        const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : undefined;
        const discountPercent = discountPercentRaw ? Number(discountPercentRaw) : undefined;
        const validFrom = validFromRaw ? new Date(validFromRaw) : undefined;
        const validTo = validToRaw ? new Date(validToRaw) : undefined;

        if (!name || price <= 0) {
          const errorMsg = "Thiếu thông tin bắt buộc (tên, giá)";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        if (!["monthly", "yearly", "lifetime"].includes(billingCycle)) {
          const errorMsg = "Chu kỳ thanh toán không hợp lệ";
          if (skipErrors) {
            results.errors.push({ row: i + 1, reason: errorMsg });
            continue;
          }
          throw new ErrorHandler(`Dòng ${i + 1}: ${errorMsg}`, 400);
        }

        const existing = await Plan.findOne({ name: name.trim() });
        if (existing) {
          existing.name = name;
          existing.description = String(descriptionRaw || "").trim();
          existing.price = price;
          existing.currency = currency;
          existing.billingCycle = billingCycle;
          existing.features = features;
          existing.isActive = isActive;
          existing.sortOrder = sortOrder;
          existing.displayType = displayType;
          if (originalPrice !== undefined) existing.originalPrice = originalPrice;
          if (discountPercent !== undefined) existing.discountPercent = discountPercent;
          if (validFrom) existing.validFrom = validFrom;
          if (validTo) existing.validTo = validTo;
          existing.updatedBy = new mongoose.Types.ObjectId(userId);
          await existing.save();
          results.updated++;
        } else {
          await Plan.create({
            name,
            description: String(descriptionRaw || "").trim(),
            price,
            currency,
            billingCycle,
            features,
            isActive: false,
            sortOrder,
            displayType,
            originalPrice,
            discountPercent,
            validFrom,
            validTo,
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

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách các gói dịch vụ đang hoạt động
  static async getActivePlans(displayType?: "default" | "vip" | "premium"): Promise<IPlan[]> {
    const query: any = { isActive: true };
    if (displayType) {
      query.displayType = displayType;
    }

    const plans = await Plan.find(query).sort({ sortOrder: 1 });
    return plans;
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết gói dịch vụ theo ID
  static async getPlanById(planId: string): Promise<IPlan> {
    const plan = await Plan.findById(planId)
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!plan) throw new ErrorHandler("Gói dịch vụ không tồn tại", 404);
    return plan;
  }

  // (ADMIN) Tạo gói dịch vụ mới
  static async createPlan(planData: IPlanData): Promise<IPlan> {
    const {
      name,
      description,
      price,
      billingCycle,
      features,
      displayType,
      originalPrice,
      discountPercent,
      validFrom,
      validTo,
      createdBy,
    } = planData;

    const maxSortOrder = await Plan.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
    const autoSortOrder = maxSortOrder ? (maxSortOrder.sortOrder || 0) + 1 : 0;

    const newPlan = await Plan.create({
      name,
      description,
      price,
      billingCycle,
      features,
      isActive: false,
      sortOrder: autoSortOrder,
      displayType,
      originalPrice,
      discountPercent,
      validFrom,
      validTo,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    return newPlan;
  }

  // (ADMIN) Cập nhật gói dịch vụ
  static async updatePlan(planId: string, planData: Partial<IPlanData>): Promise<IPlan> {
    const plan = await Plan.findById(planId);
    if (!plan) throw new ErrorHandler("Gói dịch vụ không tồn tại", 404);

    Object.keys(planData).forEach((key) => {
      if (key === "createdBy" || key === "updatedBy") {
        (plan as any)[key] = new mongoose.Types.ObjectId((planData as any)[key]);
      } else {
        (plan as any)[key] = (planData as any)[key];
      }
    });

    if (planData.updatedBy) {
      plan.updatedBy = new mongoose.Types.ObjectId(planData.updatedBy);
    }

    await plan.save();
    return plan;
  }

  // (ADMIN) Bật/tắt trạng thái hoạt động của gói dịch vụ
  static async updatePlanStatus(planId: string): Promise<IPlan> {
    const plan = await Plan.findById(planId);
    if (!plan) throw new ErrorHandler("Gói dịch vụ không tồn tại", 404);

    plan.isActive = !plan.isActive;
    await plan.save();
    return plan;
  }
}

