import { VocabularyTopics } from '../../types'
import { VocabularyHeader } from './VocabularyHeader'
import { VocabularyTopic } from './VocabularyTopic'
import { VocabularyOverview } from '@/libs/apis/api'

interface VocabularyPageProps {
  overview: VocabularyOverview
  topics: VocabularyTopics[]
}

export function VocabularyPage({ overview, topics }: VocabularyPageProps) {
  return (
    <>
      <VocabularyHeader overview={overview} />
      <VocabularyTopic topics={topics} />
    </>
  )
}

