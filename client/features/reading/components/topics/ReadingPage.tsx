import { ReadingHeader } from './ReadingHeader'
import { ReadingTopic } from './ReadingTopic'
import { ReadingOverview } from '@/libs/apis/api'
import { IReading } from '@/features/reading/types'

interface ReadingPageProps {
  overview: ReadingOverview
  readings: IReading[]
}

export function ReadingPage({ overview, readings }: ReadingPageProps) {
  return (
    <>
      <ReadingHeader overview={overview} />
      <ReadingTopic readings={readings} />
    </>
  )
}

