import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import { UserService } from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";
import { MediaService } from "../services/media.service";

export class UserController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Xuất danh sách người dùng ra file Excel
  static exportUserData = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const buffer = await UserService.exportUserData();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="users.xlsx"');
    res.status(200).send(buffer);
  });

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách người dùng (có phân trang & tìm kiếm)
  static getAllUsers = CatchAsyncError(async (req: Request, res: Response, _next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive,
      role,
    } = req.query;

    const result = await UserService.getAllUsersPaginated({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      role: role as string,
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      data: result.docs,
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
    });
  });

  // (ADMIN) Cập nhật trạng thái cho nhiều người dùng
  static updateManyUsersStatus = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ids, isActive } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("Danh sách ID người dùng trống", 400));
      }
      if (typeof isActive !== "boolean") {
        return next(new ErrorHandler("Trạng thái phải là giá trị boolean", 400));
      }

      const result = await UserService.updateManyUsersStatus(ids, isActive);

      res.status(200).json({
        success: true,
        message: `Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} ${result.updatedCount
          } người dùng thành công`,
        data: result,
      });
    }
  );

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy thông tin cá nhân của người dùng hiện tại
  static getMe = CatchAsyncError(async (req: Request, res: Response) => {
    const me = await UserService.getMe(req.user?._id as string);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin cá nhân thành công",
      data: me,
    });
  });

  // (USER) Cập nhật thông tin cá nhân
  static updateMe = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { fullName } = req.body;
    if (fullName && String(fullName).trim().length < 3)
      return next(new ErrorHandler("Tên phải có ít nhất 3 ký tự", 400));

    const me = await UserService.updateMe(req.user?._id as string, { fullName });
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: me,
    });
  });

  // (USER) Cập nhật ảnh đại diện
  static updateAvatar = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new ErrorHandler("Vui lòng tải lên file", 400));

    const userId = req.user?._id;
    if (!userId) return next(new ErrorHandler("Vui lòng đăng nhập", 401));

    const media = await MediaService.uploadMedia({
      filePath: req.file.path,
      userId,
    });

    const me = await UserService.updateAvatar(userId, media._id as string);
    res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công",
      data: me,
    });
  });

  // (USER) Đổi mật khẩu
  static changePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    if (!oldPassword || !newPassword) return next(new ErrorHandler("Thiếu mật khẩu", 400));
    if (newPassword.length < 6)
      return next(new ErrorHandler("Mật khẩu mới phải từ 6 ký tự", 400));

    await UserService.changePassword(req.user?._id as string, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  });

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Cập nhật trạng thái người dùng
  static updateUserStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) return next(new ErrorHandler("Vui lòng cung cấp ID người dùng", 400));
    if (typeof isActive !== "boolean") return next(new ErrorHandler("Trạng thái không hợp lệ", 400));

    const user = await UserService.updateUserStatus(id, isActive);

    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công`,
      data: user,
    });
  });

  // (ADMIN) Cập nhật thông tin người dùng
  static updateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { fullName, email, role, isActive } = req.body;

    if (!id) return next(new ErrorHandler("Vui lòng cung cấp ID người dùng", 400));
    if (!fullName || !email || !role)
      return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));

    const user = await UserService.updateUser(id, { fullName, email, role, isActive });

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: user,
    });
  });

  // (ADMIN) Xóa người dùng
  static deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) return next(new ErrorHandler("Vui lòng cung cấp ID người dùng", 400));

    const user = await UserService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
      data: user,
    });
  });
}