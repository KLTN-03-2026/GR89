import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { User } from '@/types'
import type { LessonStatsResponse, EntertainmentStatsEntry, RecentActivity } from '../types'

export async function getDashboardData() {
  const [user, lessonStats, entertainmentStats, recentActivities] = await Promise.all([
    fetchServer<User>('/user/me/user'),
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<EntertainmentStatsEntry[]>('/entertainment/user/stats'),
    fetchServer<RecentActivity[]>('/user/me/recent-activities')
  ])

  return {
    user,
    lessonStats,
    entertainmentStats: entertainmentStats || [],
    recentActivities: recentActivities || []
  }
}