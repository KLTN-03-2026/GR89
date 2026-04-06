import jwt from "jsonwebtoken";
require('dotenv').config()

export class JWTUtils {
  //Tạo Access Token
  static generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN as unknown as number) * 60 * 1000 || 30 * 60 * 1000 } //Hết hạn sau 30 phút
    )
  }

  //Tạo Refresh Token
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as unknown as number) * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000 } //Hết hạn sau 7 ngày
    )
  }
  // Kiểm tra Access Token có hợp lệ không
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Access Token không hợp lệ');
    }
  }

  //Kiểm tra refresh token có hợp lệ không
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || '')
    }
    catch (error) {
      throw new Error('Refresh Token không hợp lệ');
    }
  }
}
