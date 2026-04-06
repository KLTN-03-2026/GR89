import { ResultReadingPage, getReadingResult } from '@/features/reading'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const result = await getReadingResult(_id)

  return <ResultReadingPage result={result} />
}
