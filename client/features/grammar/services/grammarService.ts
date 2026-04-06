import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { LessonStatsResponse, GrammarOverview } from '@/libs/apis/api'
import type { GrammarLessonFlowData, GrammarTopic } from '../types'

export async function getGrammarData() {
  const [statsOverview, topics] = await Promise.all([
    fetchServer<LessonStatsResponse>('/user/lesson-stats'),
    fetchServer<GrammarTopic[]>('/grammar/user')
  ])

  const grammarStats = statsOverview?.grammar || {
    completed: 0,
    total: 0,
    totalAvailable: 0,
    avgScore: 0,
    totalScore: 0,
    totalTime: 0
  }

  const overview: GrammarOverview = {
    completed: grammarStats.completed ?? 0,
    total: grammarStats.total ?? 0,
    totalAvailable: grammarStats.totalAvailable ?? 0,
    avgProgress: grammarStats.avgScore ?? 0,
    totalScore: grammarStats.totalScore ?? 0,
    totalTime: grammarStats.totalTime ?? 0
  }

  return {
    overview,
    topics: topics || []
  }
}

export async function getGrammarLesson(id: string) {
  return fetchServer<GrammarLessonFlowData>(`/grammar/${id}`)
}
