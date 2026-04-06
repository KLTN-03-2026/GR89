import { ReadingVocabularyMain } from '@/features/reading'

export default function Page({ params }: { params: { _id: string } }) {
  return (
    <div>
      <ReadingVocabularyMain _id={params._id} />
    </div>
  )
}
