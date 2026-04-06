import { IUser, User, IUserPaginateResult } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import XLSX from 'xlsx'
import mongoose from "mongoose";

export class UserService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách người dùng ra file Excel
  static async exportUserData(): Promise<Buffer> {
    const users = await User.find({ role: { $in: ["user", "content"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const data = [
      [
        "_id",
        "fullName",
        "email",
        "role",
        "isActive",
        "isVip",
        "currentLevel",
        "totalPoints",
        "currentStreak",
        "totalStudyTime",
      ],
    ];

    users.forEach((user: IUser) => {
      data.push([
        String(user._id),
        user.fullName,
        user.email,
        user.role,
        user.isActive ? "true" : "false",
        user.isVip ? "true" : "false",
        user.currentLevel || "Beginner",
        String(user.totalPoints || 0),
        String(user.currentStreak || 0),
        String(user.totalStudyTime || 0)
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách người dùng (có phân trang & tìm kiếm)
  static async getAllUsersPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    isActive?: boolean;
    role?: string;
  }): Promise<IUserPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive,
      role,
    } = options;

    const query: any = { role: { $in: ["user", "content"] } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (role && role !== "all") {
      query.role = role;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const paginateOptions = {
      page,
      limit,
      sort,
      select: "-password",
      lean: false,
      customLabels: {
        docs: "users",
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

    return await User.paginate(query, paginateOptions);
  }

  // (ADMIN) Cập nhật trạng thái cho nhiều người dùng
  static async updateManyUsersStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ updatedCount: number; updatedUsers: IUser[] }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler("Danh sách ID người dùng trống", 400);
    }

    const validIds = ids
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0 && mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      throw new ErrorHandler("Không có ID hợp lệ", 400);
    }

    const result = await User.updateMany(
      { _id: { $in: validIds }, role: { $in: ["user", "content"] } },
      { $set: { isActive } }
    );

    const updatedUsers = await User.find({ _id: { $in: validIds } }).select("-password");

    return {
      updatedCount: result.modifiedCount || 0,
      updatedUsers: updatedUsers as IUser[],
    };
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy thông tin cá nhân của người dùng hiện tại
  static async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select("-password").populate("avatar", "url");

    if (!user) throw new ErrorHandler("Không tìm thấy người dùng", 404);

    return {
      _id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      avatar: user?.avatar as any,
      role: user.role,
      currentLevel: user.currentLevel,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalStudyTime: user.totalStudyTime,
      totalPoints: user.totalPoints,
      isActive: user.isActive,
      isVip: user.isVip,
      vipPlanId: user.vipPlanId?.toString() || "",
      vipStartDate: user.vipStartDate,
    } as unknown as IUser;
  }

  // (USER) Cập nhật thông tin cá nhân
  static async updateMe(userId: string, data: { fullName?: string }): Promise<IUser> {
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(data.fullName ? { fullName: data.fullName } : {}),
      },
      { new: true }
    )
      .select("-password")
      .populate("avatar", "url");

    if (!updated) throw new ErrorHandler("Không tìm thấy người dùng", 404);
    return updated;
  }

  // (USER) Cập nhật ảnh đại diện
  static async updateAvatar(userId: string, avatarMediaId: string): Promise<IUser> {
    if (!mongoose.isValidObjectId(avatarMediaId))
      throw new ErrorHandler("Media avatar không hợp lệ", 400);

    const updated = await User.findByIdAndUpdate(
      userId,
      { avatar: new mongoose.Types.ObjectId(avatarMediaId) },
      { new: true }
    )
      .select("-password")
      .populate("avatar", "url");

    if (!updated) throw new ErrorHandler("Không tìm thấy người dùng", 404);
    return updated;
  }

  // (USER) Đổi mật khẩu
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new ErrorHandler("Không tìm thấy người dùng", 404);

    const match = await user.comparePassword(oldPassword);
    if (!match) throw new ErrorHandler("Mật khẩu cũ không đúng", 400);

    user.password = newPassword;
    await user.save();
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Cập nhật trạng thái người dùng
  static async updateUserStatus(userId: string, isActive: boolean): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { _id: userId, role: { $in: ["user", "content"] } },
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền cập nhật", 404);
    }

    return user;
  }

  // (ADMIN) Cập nhật thông tin người dùng
  static async updateUser(
    userId: string,
    updateData: { fullName: string; email: string; role: string; isActive: boolean }
  ): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { _id: userId, role: { $in: ["user", "content"] } },
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền cập nhật", 404);
    }

    return user;
  }

  // (ADMIN) Xóa người dùng
  static async deleteUser(userId: string): Promise<IUser> {
    const user = await User.findOneAndDelete({
      _id: userId,
      role: { $in: ["user", "content"] },
    }).select("-password");

    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền xóa", 404);
    }

    return user;
  }
}