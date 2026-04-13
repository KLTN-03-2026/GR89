import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { AuthService, UserInfo } from "../services/auth.service";
import { CookieUtil } from "../utils/cookie.util";
import { JWTUtils } from "../utils/jwt.utils";
import { StreakService } from '../services/streak.service';
import { User } from '../models/user.model';
import { UserService } from "../services/user.service";


// Extend Request để có thêm thuộc tính user
declare global {
  namespace Express {
    interface Request {
      user?: UserInfo
    }
  }
}

// MIDDLEWARE XÁC THỰC 
export const authenticateTokenUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token_user;

    //Nếu không có access token, kiểm tra refresh token
    if (!accessToken) {
      const refeshToken = req.cookies.refresh_token_user;
      if (!refeshToken) return next(new ErrorHandler('Vui lòng đăng nhập', 410))

      // Tạo access token mới từ refresh token
      const { accessToken: newAccessToken } = await AuthService.refreshToken(refeshToken);

      //Set access token mới vào cookie
      CookieUtil.setAccessTokenCookie(res, newAccessToken, 'user');
      req.cookies.access_token_user = newAccessToken;

      //Verify token mới và lấy thông tin user
      const decoded = JWTUtils.verifyAccessToken(newAccessToken)
      const userResult = await AuthService.getUserById(decoded.userId)

      // Kiểm tra trạng thái tài khoản
      if (!userResult.user.isActive) {
        return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
      }
      req.user = userResult.user

      // Tự động kiểm tra và reset streak nếu cần (cho user role)
      if (req.user.role === 'user') {
        await StreakService.checkAndResetStreak(req.user._id)
        // Cập nhật lastActiveDate
        await updateLastActiveDateForUser(req.user._id)
      }

      return next();
    }

    //Nếu có access token, verify và lấy thông tin user
    const decoded = JWTUtils.verifyAccessToken(accessToken);
    const userResult = await AuthService.getUserById(decoded.userId);
    // Kiểm tra trạng thái tài khoản
    if (!userResult.user.isActive) {
      return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
    }

    req.user = userResult.user;

    // Tự động kiểm tra và reset streak nếu cần (cho user role)
    if (req.user.role === 'user') {
      await StreakService.checkAndResetStreak(req.user._id)
      // Cập nhật lastActiveDate
      await updateLastActiveDateForUser(req.user._id)
      // Kiểm tra vip
      await UserService.checkVip(req.user._id)
    }

    next();
  })

export const authenticateTokenAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra cả admin và content tokens
    let accessToken = req.cookies.access_token_admin || req.cookies.access_token_content;
    let refreshToken = req.cookies.refresh_token_admin || req.cookies.refresh_token_content;
    let tokenRole = 'admin';

    console.log(accessToken, refreshToken)

    // Xác định role từ token type
    if (req.cookies.access_token_content) {
      tokenRole = 'content';
    }

    //Nếu không có access token, kiểm tra refresh token
    if (!accessToken) {

      if (!refreshToken) return next(new ErrorHandler('Vui lòng đăng nhập', 410))

      // Tạo access token mới từ refresh token
      const { accessToken: newAccessToken } = await AuthService.refreshToken(refreshToken);

      //Set access token mới vào cookie
      CookieUtil.setAccessTokenCookie(res, newAccessToken, tokenRole as 'admin' | 'user' | 'content');
      req.cookies[`access_token_${tokenRole}`] = newAccessToken;

      //Verify token mới và lấy thông tin user
      const decoded = JWTUtils.verifyAccessToken(newAccessToken)
      const userResult = await AuthService.getUserById(decoded.userId)

      // Kiểm tra trạng thái tài khoản
      if (!userResult.user.isActive) {
        return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
      }

      req.user = userResult.user

      return next();
    }

    //Nếu có access token, verify và lấy thông tin user
    const decoded = JWTUtils.verifyAccessToken(accessToken);
    const userResult = await AuthService.getUserById(decoded.userId);

    // Kiểm tra trạng thái tài khoản
    if (!userResult.user.isActive) {
      return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
    }

    req.user = userResult.user;

    next();
  })

export const authenticateTokenContent = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token_content;
    //Nếu không có access token, kiểm tra refresh token
    if (!accessToken) {
      const refeshToken = req.cookies.refresh_token_content;
      if (!refeshToken) return next(new ErrorHandler('Vui lòng đăng nhập', 410))

      // Tạo access token mới từ refresh token
      const { accessToken: newAccessToken } = await AuthService.refreshToken(refeshToken);

      //Set access token mới vào cookie
      CookieUtil.setAccessTokenCookie(res, newAccessToken, 'content');
      req.cookies.access_token_content = newAccessToken;

      //Verify token mới và lấy thông tin user
      const decoded = JWTUtils.verifyAccessToken(newAccessToken)
      const userResult = await AuthService.getUserById(decoded.userId)

      // Kiểm tra trạng thái tài khoản
      if (!userResult.user.isActive) {
        return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
      }

      req.user = userResult.user

      return next();
    }

    //Nếu có access token, verify và lấy thông tin user
    const decoded = JWTUtils.verifyAccessToken(accessToken);
    const userResult = await AuthService.getUserById(decoded.userId);

    // Kiểm tra trạng thái tài khoản
    if (!userResult.user.isActive) {
      return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
    }

    req.user = userResult.user;
    next();
  })

// MIDDLEWARE XÁC THỰC CHO LOGOUT (không kiểm tra isActive)
export const authenticateTokenForLogout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token_user || req.cookies.access_token_admin || req.cookies.access_token_content;
    const refreshToken = req.cookies.refresh_token_user || req.cookies.refresh_token_admin || req.cookies.refresh_token_content;

    // Nếu không có token nào, cho phép tiếp tục (logout vẫn có thể thực hiện)
    if (!accessToken && !refreshToken) {
      return next();
    }

    // Nếu có access token, verify và lấy thông tin user (không kiểm tra isActive)
    if (accessToken) {
      const decoded = JWTUtils.verifyAccessToken(accessToken);
      const userResult = await AuthService.getUserById(decoded.userId);
      req.user = userResult.user;
    }

    next();
  }
)

// MIDDLEWARE PHÂN QUYỀN
export const requireRole = (roles: string[]) => {
  return CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    //Kiếm tra role
    if (!roles.includes(req.user.role)) return next(new ErrorHandler('Bạn không có quyền truy cập', 403))

    next();
  })
}

// MIDDLEWARE KIỂM TRA QUYỀN QUẢN LÝ NỘI DUNG
export const requireContentPermission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

  // Admin có tất cả quyền
  if (req.user.role === 'admin') {
    return next()
  }

  // Content manager có quyền quản lý nội dung
  if (req.user.role === 'content') {
    return next()
  }

  return next(new ErrorHandler('Bạn không có quyền quản lý nội dung', 403))
})

// Helper function để cập nhật lastActiveDate cho user
async function updateLastActiveDateForUser(userId: string): Promise<void> {
  await User.updateOne(
    { _id: userId },
    { lastActiveDate: new Date() }
  )
}

// MIDDLEWARE CẬP NHẬT LASTACTIVEDATE CHO USER
// Có thể sử dụng middleware này riêng nếu cần áp dụng cho các routes cụ thể
// Chỉ cập nhật cho user role, không cập nhật cho admin/content
export const updateLastActiveDate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Chỉ cập nhật nếu có user và là role 'user'
  if (req.user && req.user.role === 'user') {
    await updateLastActiveDateForUser(req.user._id)
  }

  next()
})