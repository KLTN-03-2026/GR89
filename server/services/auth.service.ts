import { User } from '../models/user.model'
import ErrorHandler from '../utils/ErrorHandler'
import { JWTUtils } from '../utils/jwt.utils'
import { Media } from '../models/media.model';
import crypto from 'crypto';
import { sendMail } from '../providers/mailer.provider';
import bcrypt from 'bcrypt';
import { StreakService } from './streak.service'
import axios from 'axios';
import { Plan } from '../models/plan.model';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
  role: string;
}

export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  currentLevel: string;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  isActive: boolean;
  isVip: boolean;
  vipPlanId: string;
  vipStartDate: Date;
}

interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  streakWarning?: string;
}

export class AuthService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // LẤY THÔNG TIN USER THEO ID
  static async getUserById(userId: string): Promise<{ user: UserInfo }> {
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler('Không tìm thấy người dùng', 404);
    }

    //Lấy avatar media
    const avatar = await Media.findById(user.avatar)

    return {
      user: {
        _id: (user._id as any).toString(),
        fullName: user.fullName,
        email: user.email,
        avatar: avatar?.url || '',
        role: user.role,
        isActive: user.isActive,
        isVip: user.isVip || false,
        vipPlanId: user.vipPlanId?.toString() || '',
        vipStartDate: user.vipStartDate || null,
      } as unknown as UserInfo
    };
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // ĐĂNG KÍ TÀI KHOẢN MỚI
  static async register(userData: RegisterData) {
    const { fullName, email, password } = userData;

    //Tạo token để xác thực email
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    //Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email })

    if (existingUser && existingUser.isEmailVerified) {
      throw new ErrorHandler('Email đã tồn tại', 400);
    }
    else if (existingUser && !existingUser.isEmailVerified) {
      existingUser.fullName = fullName;
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.verificationToken = token;
      existingUser.verificationTokenExpires = expires;
      await existingUser.save();
    }
    else {
      //Tạo user mới
      await User.create({
        fullName,
        email,
        password,
        verificationToken: token,
        verificationTokenExpires: expires
      })
    }

    const verifyUrl = `${process.env.SERVER_BASE_URL || 'http://localhost:8000'}/api/auth/verify-email?token=${token}`;

    await sendMail({
      to: email,
      subject: 'Xác nhận đăng kí tài khoản',
      html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Chào ${fullName},</h2>
        <p>Nhấn nút dưới đây để xác nhận email của bạn:</p>
        <p>
          <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
            Xác nhận email
          </a>
        </p>
        <p>Nếu không bấm được, copy link sau:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `
    })
  }

  // VERIFY EMAIL
  static async verifyEmail(token: string) {
    const user = await User.findOne({ verificationToken: token })
    if (!user) throw new ErrorHandler('Token không hợp lệ', 400);

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) throw new ErrorHandler('Token đã hết hạn', 400);

    user.isEmailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()
  }

  // QUÊN MẬT KHẨU
  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) return { message: 'Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Nhấn vào liên kết sau để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      `
    });

    return { message: 'Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại.' };
  }

  // ĐẶT LẠI MẬT KHẨU
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+password');

    if (!user) throw new ErrorHandler('Token không hợp lệ hoặc đã hết hạn', 400);

    user.password = newPassword; // sẽ được hash bởi pre('save')
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await user.save();

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' };
  }

  // ĐĂNG NHẬP NGƯỜI DÙNG
  static async login(loginData: LoginData): Promise<AuthResponse> {
    const { email, password, role } = loginData;

    //Tìm user có password
    const user = await User.findOne({ email: email.toLocaleLowerCase().trim(), role }).select('+password')

    if (!user) throw new ErrorHandler('Email không tồn tại', 400);

    const isPasswordValid = await user?.comparePassword(password);
    if (!isPasswordValid) throw new ErrorHandler('Mật khẩu không chính xác', 400);

    // Kiểm tra trạng thái tài khoản
    if (!user.isActive) throw new ErrorHandler('Tài khoản của bạn đã bị khóa', 403);

    // Kiểm tra email đã được xác thực chưa
    if (role === 'user' && !user.isEmailVerified) throw new ErrorHandler('Vui lòng xác thực email để đăng nhập', 400);

    // Kiểm tra streak khi đăng nhập
    const streakCheck = await StreakService.checkAndResetStreak((user?._id as any).toString())

    // Reload user sau khi check streak (vì streak có thể đã bị reset)
    const updatedUser = await User.findById(user._id)
    if (!updatedUser) throw new ErrorHandler('User không tồn tại', 404)

    //Lấy avatar media
    const avatar = await Media.findById(updatedUser.avatar)

    //Tạo JWT tokens
    const accessToken = JWTUtils.generateAccessToken((updatedUser._id as any).toString());
    const refreshToken = JWTUtils.generateRefreshToken((updatedUser._id as any).toString());

    //Trả về kết quả
    return {
      user: {
        _id: (user._id as any).toString(),
        fullName: user.fullName,
        email: user.email,
        avatar: avatar?.url || '/images/avatar-default.jpg',
        role: user.role,
        isActive: user.isActive,
        isVip: user.isVip || false,
        vipPlanId: user.vipPlanId?.toString() || '',
        vipStartDate: user.vipStartDate || null,
      } as unknown as UserInfo,
      accessToken,
      refreshToken,
      streakWarning: streakCheck.streakLost ? streakCheck.message : undefined
    }
  }

  // ĐĂNG NHẬP VỚI GOOGLE
  static async loginGoogle(token: string): Promise<AuthResponse> {
    const res = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = res.data;

    let existingUser = await User.findOne({ email: user.email })
    if (!existingUser) {
      const avatar = await Media.create({
        type: 'image',
        url: user.picture,
        width: 96,
        height: 96,
        format: 'png',
        size: 0,
        publicId: `google-avatar-${Date.now()}`
      })

      //Tạo user mới
      existingUser = await User.create({
        fullName: user.name,
        email: user.email,
        avatar: avatar._id
      })
    }

    // Kiểm tra streak khi đăng nhập
    const streakCheck = await StreakService.checkAndResetStreak((existingUser?._id as any).toString())

    const accessToken = JWTUtils.generateAccessToken((existingUser._id as any).toString());
    const refreshToken = JWTUtils.generateRefreshToken((existingUser._id as any).toString());

    //Trả về kết quả
    return {
      user: {
        _id: (existingUser._id as any).toString(),
        fullName: existingUser.fullName,
        email: existingUser.email,
        avatar: existingUser.avatar || '/images/avatar-default.jpg',
        role: existingUser.role,
        isActive: existingUser.isActive,
        isVip: existingUser.isVip || false,
        vipPlanId: existingUser.vipPlanId?.toString() || '',
        vipStartDate: existingUser.vipStartDate || null,
      } as unknown as UserInfo,
      accessToken,
      refreshToken,
      streakWarning: streakCheck.streakLost ? streakCheck.message : undefined
    }
  }

  //LÀM MỚI ACCESS TOKEN
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    //verify refesh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken)

    if (!decoded) throw new ErrorHandler('Refresh token không hợp lệ', 401);

    const user = await User.findById(decoded.userId)
    if (!user) throw new ErrorHandler('User không tồn tại', 401);

    //Tạo access token mới
    const accessToken = JWTUtils.generateAccessToken((user._id as any).toString());

    return { accessToken }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) TẠO USER MỚI
  static async createUser(userData: RegisterData): Promise<UserInfo> {
    const { fullName, email, password, role } = userData;

    //Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email })
    if (existingUser) throw new ErrorHandler('Email đã tồn tại', 400);

    //Tạo user mới
    const newUser = await User.create({
      fullName,
      email,
      password,
      role
    })

    await newUser.save();

    return {
      _id: (newUser._id as any).toString(),
      fullName: newUser.fullName,
      email: newUser.email,
      avatar: '',
      role: newUser.role,
      isActive: newUser.isActive,
      isVip: newUser.isVip || false,
      vipPlanId: newUser.vipPlanId?.toString() || '',
      vipStartDate: newUser.vipStartDate || null,
    } as unknown as UserInfo
  }

  // LẤY THÔNG TIN USER THEO EMAIL
  static async loginAdmin(email: string, password: string): Promise<{ user: UserInfo, accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ErrorHandler('Email không tồn tại', 400);

    if (user.role !== 'admin' && user.role !== 'content') throw new ErrorHandler('Tài khoản này không có quyền truy cập admin panel', 403);

    const isPasswordValid = await user?.comparePassword(password);
    if (!isPasswordValid) throw new ErrorHandler('Mật khẩu không chính xác', 400);

    if (!user.isActive) throw new ErrorHandler('Tài khoản của bạn đã bị khóa', 403);

    //Tạo JWT tokens
    const accessToken = JWTUtils.generateAccessToken((user._id as any).toString());
    const refreshToken = JWTUtils.generateRefreshToken((user._id as any).toString());

    return { user: user as unknown as UserInfo, accessToken, refreshToken }
  }
}