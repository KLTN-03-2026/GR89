import { getSpeakingResult } from '@/features/speaking'
import { FinalResultsView } from '@/features/speaking/components/lesson/FinalResultsView'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const results = await getSpeakingResult(_id)
  return <FinalResultsView results={results} />
}
