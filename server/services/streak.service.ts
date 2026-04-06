import mongoose from 'mongoose'
import { User } from '../models/user.model'

// Múi giờ tính theo phút (ví dụ: Việt Nam +7 giờ = 420 phút)
const TZ_OFFSET_MINUTES = Number(process.env.TZ_OFFSET_MINUTES ?? 420)

function toLocalDate(date: Date): Date {
  const d = new Date(date.getTime() + TZ_OFFSET_MINUTES * 60 * 1000)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function isSameDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false
  const da = toLocalDate(a)
  const db = toLocalDate(b)
  return da.getTime() === db.getTime()
}

function isYesterday(last?: Date | null, now?: Date | null): boolean {
  if (!last || !now) return false
  const l = toLocalDate(last)
  const n = toLocalDate(now)
  const diffDays = Math.round((n.getTime() - l.getTime()) / (24 * 60 * 60 * 1000))
  return diffDays === 1
}

export class StreakService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  static async getStatus(userId: string, at: Date = new Date()) {
    const user = await User.findById(userId)
    if (!user) return null
    const todayDone = isSameDay(user.lastActiveDate ?? null, at)
    const localMidnight = toLocalDate(at)
    const nextResetTime = new Date(localMidnight.getTime() + 24 * 60 * 60 * 1000)
    user.lastActiveDate = at
    await user.save()
    return {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      todayDone,
      nextResetTime,
      freezeCount: user.freezeCount || 0
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  static async checkAndResetStreak(userId: string, checkAt: Date = new Date()): Promise<{ streakLost: boolean; message?: string; oldStreak?: number }> {
    const user = await User.findById(userId)
    if (!user) return { streakLost: false }

    if (!user.avatar) user.avatar = new mongoose.Types.ObjectId('69293c75f29d5312d6568881') as any
    const last = user.lastActiveDate ?? null
    const now = checkAt

    // Nếu đã học hôm nay hoặc hôm qua thì streak còn hiệu lực
    if (isSameDay(last, now) || isYesterday(last, now)) {
      return { streakLost: false }
    }

    // Nếu không học hôm qua và chuỗi > 0 → Mất chuỗi
    const oldStreak = user.currentStreak > 0 ? user.currentStreak : undefined

    // Cập nhật tất cả thay đổi cùng lúc
    user.lastActiveDate = now
    if (user.currentStreak > 0) {
      user.currentStreak = 0
    }

    // Chỉ save 1 lần với tất cả thay đổi
    await user.save()

    if (oldStreak) {
      return {
        streakLost: true,
        message: `Chuỗi học tập ${oldStreak} ngày đã bị mất! Hôm qua bạn không học bài nào cả.`,
        oldStreak
      }
    }

    return { streakLost: false }
  }

  /**
   * Cập nhật streak khi hoàn thành bài học
   * Tính theo ngày thực tế (calendar day), không phải 24 giờ
   * Ví dụ: 23h59 ngày 1 → 00h01 ngày 3 = 2 ngày (bỏ qua ngày 2)
   */
  static async update(userId: string) {
    const user = await User.findById(userId)
    if (!user) return

    const last = user.lastLearnDate ?? null
    const now = new Date()

    // Nếu đã học hôm nay - không cần cập nhật streak
    if (isSameDay(last, now)) {
      return
    }

    // Tính số ngày chênh lệch (theo calendar day)
    let diffDays = 0
    if (last) {
      const lastLocal = toLocalDate(last)
      const nowLocal = toLocalDate(now)
      diffDays = Math.round((nowLocal.getTime() - lastLocal.getTime()) / (24 * 60 * 60 * 1000))
    }

    // Cập nhật lastLearnDate
    user.lastLearnDate = now

    if (diffDays === 1) {
      // Học liên tục (ngày liền trước) → Tăng streak
      user.currentStreak = (user.currentStreak || 0) + 1
    } else if (diffDays > 1) {
      // Bỏ qua ngày → Reset streak về 1 (bắt đầu chuỗi mới)
      user.currentStreak = 1
    } else {
      // diffDays === 0 (không nên xảy ra vì đã check isSameDay) hoặc last === null
      // Nếu chưa có lastLearnDate → bắt đầu streak = 1
      if (!last) {
        user.currentStreak = 1
      }
    }

    // Cập nhật longestStreak nếu cần
    if (user.currentStreak > (user.longestStreak || 0)) {
      user.longestStreak = user.currentStreak
    }

    await user.save()
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
}
