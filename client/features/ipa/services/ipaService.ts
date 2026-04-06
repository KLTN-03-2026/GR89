import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, IpaOverview } from '@/libs/apis/api'
import type { IIpa } from '../types'

export async function getIpaData() {
  const [statsOverview, ipaList] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<IIpa[]>('/ipa/user')
  ])

  const ipaStats = statsOverview?.ipa || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: IpaOverview = {
    completed: ipaStats.completed ?? 0,
    total: ipaStats.total ?? 0,
    totalAvailable: ipaStats.totalAvailable ?? 0,
    avgProgress: ipaStats.avgScore ?? 0,
    totalScore: ipaStats.totalScore ?? 0,
    totalTime: ipaStats.totalTime ?? 0
  }

  return {
    overview,
    ipaList: ipaList || []
  }
}
