import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, WritingOverview } from '@/libs/apis/api'
import type { writingTopics, writing, resultWriting } from '../types'

export async function getWritingData() {
  const [statsOverview, topics] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<writingTopics[]>('/writing/user')
  ])

  const writingStats = statsOverview?.writing || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: WritingOverview = {
    completed: writingStats.completed ?? 0,
    total: writingStats.total ?? 0,
    totalAvailable: writingStats.totalAvailable ?? 0,
    avgProgress: writingStats.avgScore ?? 0,
    totalScore: writingStats.totalScore ?? 0,
    totalTime: writingStats.totalTime ?? 0
  }

  return {
    overview,
    topics: topics || []
  }
}

export async function getWritingLesson(_id: string) {
  const writingData = await fetchServer<writing>(`/writing/user/${_id}`)
  return writingData
}

export async function getWritingResult(_id: string) {
  const result = await fetchServer<resultWriting>(`/writing/${_id}/result`)
  return result
}
