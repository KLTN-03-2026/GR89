import mongoose, { Document, Schema } from "mongoose"
import bcrypt from "bcrypt"
import mongoosePaginate from 'mongoose-paginate-v2'

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName: string;
  avatar: string | null;
  dateOfBirth?: Date | null;
  phone?: string;
  country?: string;
  city?: string;
  provider: 'email' | 'google' | 'facebook'
  role: 'user' | 'admin' | 'content';
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalPoints: number;
  isActive: boolean;
  lastActiveDate?: Date;
  lastLearnDate?: Date;
  vipPlanId?: mongoose.Types.ObjectId;
  vipStartDate?: Date;
  vipExpireDate?: Date;
  freezeCount?: number;
  isEmailVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Methods
  comparePassword(password: string): Promise<boolean>;
}

// Interface for pagination result
export interface IUserPaginateResult {
  docs: IUser[]
  total: number
  limit: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  next?: number
  prev?: number
  pagingCounter: number
  meta?: any
}

export interface IUserModel extends mongoose.Model<IUser> {
  paginate(query?: any, options?: any): Promise<IUserPaginateResult>
}

// Regex kiểm tra email hợp lệ
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema user
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true, //Không được trùng lặp
    lowercase: true, //Chuyển email thành chữ thường
    validate: {
      validator: (val: string) => emailRegexPattern.test(val),
      message: 'Email không hợp lệ',
    },
  },
  password: {
    type: String,
    select: false, //Không hiển thị mật khẩu khi lấy dữ liệu
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập tên người dùng'],
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng không được vượt quá 30 ký tự'],
    trim: true
  },
  avatar: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  country: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'content'],
    default: 'user',
  },
  provider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email',
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  totalStudyTime: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  lastLearnDate: {
    type: Date,
    default: null,
  },
  vipPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
  },
  vipStartDate: {
    type: Date,
    default: null,
  },
  vipExpireDate: {
    type: Date,
    default: null
  },
  freezeCount: {
    type: Number,
    default: 0,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
}, { timestamps: true })

//METHOD SO SÁNH MẬT KHẨU
// Dùng để kiểm tra mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
}

//METHOD HASH MẬT KHẨU
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
})

// Normalize avatar field to null when empty
userSchema.pre('save', function (next) {
  const avatarValue = this.avatar as unknown
  if (avatarValue === '' || avatarValue === undefined) {
    this.avatar = null as any
  }
  next()
})

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Record<string, any> | undefined
  if (!update) return next()

  const normalize = (target: Record<string, any>) => {
    if (Object.prototype.hasOwnProperty.call(target, 'avatar')) {
      const value = target.avatar
      if (value === '' || value === undefined) {
        target.avatar = null
      }
    }
  }

  if (update.$set) {
    normalize(update.$set)
  } else {
    normalize(update)
  }

  next()
})

// Tạo index cho email để tìm kiếm nhanh hơn
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ fullName: 'text', email: 'text' });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);