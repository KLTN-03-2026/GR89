import { Response } from 'express'

export class CookieUtil {
  // Đặt Access Token vào cookie
  static setAccessTokenCookie(res: Response, token: string, role: 'admin' | 'user' | 'content') {
    res.cookie(`access_token_${role}`, token, {
      httpOnly: true, // Không thể truy cập từ client (chống XSS)
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở production
      sameSite: 'lax', // Ngăn chặn CSRF
      maxAge: (process.env.JWT_EXPIRES_IN as unknown as number) * 60 * 1000 || 30 * 60 * 1000, //Hết hạn sau 30 phút
      path: '/', // Áp dụng cho tất cả đường dẫn
    })
  }

  // Đặt refresh token vào cookie
  static setRefreshTokenCookie(res: Response, token: string, role: 'admin' | 'user' | 'content') {
    res.cookie(`refresh_token_${role}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:
        (process.env.JWT_REFRESH_EXPIRES_IN as unknown as number) * 24 * 60 * 60 * 1000 ||
        7 * 24 * 60 * 60 * 1000, // ⏰ Hết hạn sau 7 ngày
      path: '/',
    })
  }

  // Xóa tất cả cookies xác thực (khi đăng xuất)
  static clearAuthCookies(res: Response, role: 'admin' | 'user' | 'content') {
    res.clearCookie(`access_token_${role === 'content' ? 'admin' : role}`)
    res.clearCookie(`refresh_token_${role === 'content' ? 'admin' : role}`)
  }
}
