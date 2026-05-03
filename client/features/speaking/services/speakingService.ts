import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, SpeakingOverview } from '@/libs/apis/api'
import type { SpeakingData } from '../types'
import { SentenceEvaluation } from '../components/lesson/types'

export async function getSpeakingData() {
  const [statsOverview, speakings] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<SpeakingData[]>('/speaking/user')
  ])

  const speakingStats = statsOverview?.speaking || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: SpeakingOverview = {
    completed: speakingStats.completed ?? 0,
    total: speakingStats.total ?? 0,
    totalAvailable: speakingStats.totalAvailable ?? 0,
    avgProgress: speakingStats.avgScore ?? 0,
    totalScore: speakingStats.totalScore ?? 0,
    totalTime: speakingStats.totalTime ?? 0
  }

  return {
    overview,
    speakings: speakings || []
  }
}

export async function getSpeakingLesson(_id: string) {
  const speaking = await fetchServer<SpeakingData>(`/speaking/user/${_id}`)
  return speaking
}

export async function getSpeakingResult(_id: string) {
  return fetchServer<SentenceEvaluation[]>(`/speaking/user/${_id}/result`)
}
