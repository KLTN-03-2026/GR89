import { GrammarHeader } from './GrammarHeader'
import { GrammarTopics } from './GrammarTopics'
import { GrammarOverview } from '@/libs/apis/api'
import { GrammarTopic } from '@/features/grammar/types'

interface GrammarPageProps {
  overview: GrammarOverview
  topics: GrammarTopic[]
}

export function GrammarPage({ overview, topics }: GrammarPageProps) {
  return (
    <>
      <GrammarHeader overview={overview} />
      <GrammarTopics topics={topics} />
    </>
  )
}
