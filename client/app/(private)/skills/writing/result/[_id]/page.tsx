import { getWritingResult } from '@/features/writing'
import ResultCard from '@/features/writing/components/lesson/ResultCard'
import { resultWriting } from '@/features/writing/types'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const result = await getWritingResult(_id)

  return (
    <div className="max-w-7xl mx-auto">
      <ResultCard result={result as resultWriting} />
    </div>
  )
}
