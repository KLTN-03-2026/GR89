import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, ListeningOverview } from '@/libs/apis/api'
import type { IListening, IListeningProgress } from '../types'

export async function getListeningData() {
  const [statsOverview, listenings] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<IListening[]>('/listening/user')
  ])

  const listeningStats = statsOverview?.listening || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: ListeningOverview = {
    completed: listeningStats.completed ?? 0,
    total: listeningStats.total ?? 0,
    totalAvailable: listeningStats.totalAvailable ?? 0,
    avgProgress: listeningStats.avgScore ?? 0,
    totalScore: listeningStats.totalScore ?? 0,
    totalTime: listeningStats.totalTime ?? 0
  }

  return {
    overview,
    listenings: listenings || []
  }
}

// Lấy dữ liệu bài học listening
export async function getListeningLesson(_id: string) {
  const listening = await fetchServer<IListening>(`/listening/user/${_id}`)
  return listening
}

export async function getListeningResult(_id: string) {
  const result = await fetchServer<IListeningProgress>(`/listening/${_id}/result`)
  return result
}
