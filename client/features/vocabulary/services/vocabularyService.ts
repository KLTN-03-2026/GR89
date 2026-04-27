import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { VocabularyOverview } from '@/libs/apis/api'
import type { VocabularyTopics } from '../types'

export async function getVocabularyData() {
  const [overview, topics] = await Promise.all([
    fetchServer<VocabularyOverview>('/vocabulary/overview-user'),
    fetchServer<VocabularyTopics[]>('/vocabulary/topics-user')
  ])

  return {
    overview: overview || {
      learnedWords: 0,
      completedTopics: 0,
      totalAvailable: 0,
      totalTopics: 0,
      avgScore: 0,
      totalScore: 0,
      totalTime: 0
    },
    topics: topics || []
  }
}

export async function getVocabularyTopic(_id: string) {
  const topic = await fetchServer<VocabularyTopics>(`/vocabulary/${_id}/user`)
  return topic
}
