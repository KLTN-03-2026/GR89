import { WritingHeader } from './WritingHeader'
import { WritingTopic } from './WritingTopic'
import { WritingOverview } from '@/libs/apis/api'
import { writingTopics } from '@/types'

interface WritingPageProps {
  overview: WritingOverview
  topics: writingTopics[]
}

export function WritingPage({ overview, topics }: WritingPageProps) {
  return (
    <>
      <WritingHeader overview={overview} />
      <WritingTopic topics={topics} />
    </>
  )
}

