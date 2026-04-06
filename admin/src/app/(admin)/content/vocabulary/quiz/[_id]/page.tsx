import { VocabularyQuizDetailMain } from '@/features/vocabulary'

export default function page({ params }: { params: { _id: string } }) {
  return (
    <div>
      <VocabularyQuizDetailMain _id={params._id} />
    </div>
  )
}
