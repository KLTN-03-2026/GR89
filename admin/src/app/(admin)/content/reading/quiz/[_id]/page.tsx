import { ReadingQuizDetailMain } from '@/features/reading'

export default async function Page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  return (
    <div>
      <ReadingQuizDetailMain _id={_id} />
    </div>
  )
}
