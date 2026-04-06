import { ReadingPage } from '@/features/reading'
import { getReadingData } from '@/features/reading/services/readingService'

export default async function page() {
  const { overview, readings } = await getReadingData()

  return <ReadingPage overview={overview} readings={readings} />
}
