import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, ReadingOverview } from '@/libs/apis/api'
import type { IReading } from '../types'

export async function getReadingData() {
  const [statsOverview, readings] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<IReading[]>('/reading/user')
  ])

  const readingStats = statsOverview?.reading || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: ReadingOverview = {
    completed: readingStats.completed ?? 0,
    total: readingStats.total ?? 0,
    totalAvailable: readingStats.totalAvailable ?? 0,
    avgProgress: readingStats.avgScore ?? 0,
    totalScore: readingStats.totalScore ?? 0,
    totalTime: readingStats.totalTime ?? 0
  }

  return {
    overview,
    readings: readings || []
  }
}

export async function getReadingLesson(_id: string) {
  const reading = await fetchServer<IReading>(`/reading/user/${_id}`)
  return reading
}
