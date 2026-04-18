import { NextFunction, Request, Response } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'
import { AuthService, UserInfo } from '../services/auth.service'
import { CookieUtil } from '../utils/cookie.util'

export class AuthController {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // LẤY THÔNG TIN USER
  static getProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))
    const result = await AuthService.getUserById(req.user._id)

    return res.status(200).json({
      success: true,
      data: result.user,
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // ĐĂNG KÍ NGƯỜI DÙNG
  static register = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password, confirmPassword } = req.body

    if (!fullName || !email || !password || !confirmPassword)
      return next(new ErrorHandler('Vui lòng điển đầy đủ thông tin', 400))

    if (password !== confirmPassword) return next(new ErrorHandler('Mật khẩu không khớp', 400))

    if (password.length < 8) return next(new ErrorHandler('Mật khẩu phải có ít nhất 8 ký tự', 400))

    if (password.length > 30)
      return next(new ErrorHandler('Mật khẩu không được vượt quá 30 ký tự', 400))

    // Kiểm tra email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return next(new ErrorHandler('Email không hợp lệ', 400))

    //Gọi service để xử lý đăng ký người dùng
    await AuthService.register({ fullName, email, password })

    //Trả về thông tin người dùng
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.',
    })
  })

  // XÁC NHẬN EMAIL
  static verifyEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query
    const appUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000'

    if (!token || typeof token !== 'string') {
      return res.status(400).render('auth/verify-error', {
        title: 'Xác minh thất bại',
        headline: 'Không thể xác minh email',
        message: 'Thiếu hoặc token không hợp lệ.',
        homeUrl: `${appUrl}`,
      })
    }

    try {
      await AuthService.verifyEmail(token)
      return res.status(200).render('auth/verify-success', {
        title: 'Xác minh thành công',
        headline: 'Email đã được xác minh',
        message: 'Bạn có thể đăng nhập để tiếp tục.',
        loginUrl: `${appUrl}/login`,
        homeUrl: `${appUrl}`,
      })
    } catch (err: any) {
      return res.status(400).render('auth/verify-error', {
        title: 'Xác minh thất bại',
        headline: 'Không thể xác minh email',
        message: err?.message || 'Token không hợp lệ hoặc đã hết hạn.',
        homeUrl: `${appUrl}`,
      })
    }
  })

  // QUÊN MẬT KHẨU
  static requestPasswordReset = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body
      if (!email) return next(new ErrorHandler('Thiếu email', 400))
      const result = await AuthService.requestPasswordReset(email)
      return res.status(200).json({ success: true, message: result.message })
    },
  )

  // ĐẶT LẠI MẬT KHẨU
  static resetPassword = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token, password, confirmPassword } = req.body
      if (!token || !password || !confirmPassword)
        return next(new ErrorHandler('Thiếu dữ liệu', 400))
      if (password !== confirmPassword) return next(new ErrorHandler('Mật khẩu không khớp', 400))
      if (password.length < 8) return next(new ErrorHandler('Mật khẩu phải ≥ 8 ký tự', 400))

      const result = await AuthService.resetPassword(token, password)
      return res.status(200).json({ success: true, message: result.message })
    },
  )

  // ĐĂNG NHẬP NGƯỜI DÙNG
  static login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role } = req.body

    if (!email || !password) return next(new ErrorHandler('Vui lòng điển đầy đủ thông tin', 400))

    if (role != 'user' && role != 'admin' && role != 'content')
      return next(new ErrorHandler('Vui lòng chọn vai trò', 400))

    const result = await AuthService.login({ email, password, role })

    CookieUtil.setAccessTokenCookie(res, result.accessToken, role)
    CookieUtil.setRefreshTokenCookie(res, result.refreshToken, role)

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result.user,
    })
  })

  // ĐĂNG NHẬP VỚI GOOGLE
  static loginGoogle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body

    const result = await AuthService.loginGoogle(token)
    CookieUtil.setAccessTokenCookie(res, result.accessToken, 'user')
    CookieUtil.setRefreshTokenCookie(res, result.refreshToken, 'user')

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result.user,
    })
  })

  // ĐĂNG XUẤT NGƯỜI DÙNG
  static logout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // Xác định role từ cookies nếu không có user (trường hợp tài khoản bị khóa)
    let userRole: 'admin' | 'user' | 'content' = 'user'

    if (req.user) {
      userRole = req.user.role as 'admin' | 'user' | 'content'
    } else {
      // Nếu không có user, kiểm tra cookies để xác định role
      if (req.cookies.access_token_admin || req.cookies.refresh_token_admin) {
        userRole = 'admin'
      } else if (req.cookies.access_token_content || req.cookies.refresh_token_content) {
        userRole = 'content'
      }
    }

    CookieUtil.clearAuthCookies(res, userRole)

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    })
  })

  // REFESH TOKEN
  static refeshToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const requestedRole = req.body?.role as 'admin' | 'user' | 'content' | undefined
    let role: 'admin' | 'user' | 'content' | undefined = requestedRole

    // Tự động suy luận role nếu body không gửi hoặc gửi sai role
    if (!role || !req.cookies[`refresh_token_${role}`]) {
      if (req.cookies.refresh_token_admin) role = 'admin'
      else if (req.cookies.refresh_token_content) role = 'content'
      else if (req.cookies.refresh_token_user) role = 'user'
    }

    if (!role) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    const refreshToken = req.cookies[`refresh_token_${role}`]
    if (!refreshToken) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    const result = await AuthService.refreshToken(refreshToken)
    if (!result) return next(new ErrorHandler('Làm mới token thất bại', 401))
    CookieUtil.setAccessTokenCookie(res, result.accessToken, role)

    return res.status(200).json({
      success: true,
      message: 'Token đã được làm mới',
      data: {
        accessToken: result.accessToken,
      },
    })
  })

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // ĐĂNG NHẬP TỰ ĐỘNG XÁC ĐỊNH ROLE
  static loginAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    if (!email || !password) return next(new ErrorHandler('Vui lòng điển đầy đủ thông tin', 400))

    // Tìm user theo email để lấy role
    const result = await AuthService.loginAdmin(email, password)

    CookieUtil.setAccessTokenCookie(res, result.accessToken, 'admin')
    CookieUtil.setRefreshTokenCookie(res, result.refreshToken, 'admin')

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result.user,
    })
  })

  // (ADMIN) TẠO USER MỚI
  static createUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password, role } = req.body

    if (!fullName || !email || !password || !role)
      return next(new ErrorHandler('Vui lòng điển đầy đủ thông tin', 400))

    if (password.length < 8) return next(new ErrorHandler('Mật khẩu phải có ít nhất 8 ký tự', 400))

    if (password.length > 30)
      return next(new ErrorHandler('Mật khẩu không được vượt quá 30 ký tự', 400))

    const allowedTlds = ['com', 'net', 'org', 'vn', 'edu', 'gov', 'io', 'co']
    const emailRegex = new RegExp('^[^\s@]+@[^\s@]+\.(?<tld>[a-zA-Z]{2,})$')
    const match = email.match(emailRegex)
    if (!match || !allowedTlds.includes(match.groups?.tld?.toLowerCase() || '')) {
      return next(new ErrorHandler('Email không hợp lệ', 400))
    }

    const result = await AuthService.createUser({ fullName, email, password, role })

    return res.status(200).json({
      success: true,
      message: 'Tạo user thành công',
      data: result,
    })
  })
}
