import { ReadingVocabularyMain } from '@/features/reading'

export default async function Page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  return (
    <div>
      <ReadingVocabularyMain _id={_id} />
    </div>
  )
}
