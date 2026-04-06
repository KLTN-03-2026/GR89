import { getMyProfile, getStreakStatus } from '@/features/account/services/accountApi'
import { toast } from 'react-toastify'

/**
 * Cập nhật streak và refresh user profile
 * Gọi sau khi hoàn thành bài học để cập nhật streak trong localStorage và user context
 */
export async function notifyStreakIncrease() {
  try {
    // Lấy streak status mới nhất
    const streakRes = await getStreakStatus()
    if (!streakRes.success) return

    const newStreak = streakRes.data.currentStreak
    const oldStreak = Number(localStorage.getItem('currentStreak') || '0')

    // Cập nhật localStorage
    localStorage.setItem('currentStreak', String(newStreak))

    // Refresh user profile để cập nhật streak trong user object
    const profileRes = await getMyProfile()
    if (profileRes.success && profileRes.data) {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user) {
        // Cập nhật streak trong user object từ profile response
        const updatedUser = {
          ...user,
          currentStreak: profileRes.data.currentStreak ?? newStreak,
          longestStreak: profileRes.data.longestStreak ?? user.longestStreak ?? 0,
          totalPoints: profileRes.data.totalPoints ?? user.totalPoints ?? 0,
          totalStudyTime: profileRes.data.totalStudyTime ?? user.totalStudyTime ?? 0
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        // Trigger re-render bằng cách dispatch custom event
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }))
      }
    }

    // Hiển thị toast nếu streak tăng
    if (newStreak > oldStreak && newStreak > 0) {
      toast.success(`🔥 Chuỗi tăng lên ${newStreak} ngày!`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light'
      })
    }
  } catch (error) {
    console.error('Error updating streak:', error)
  }
}


