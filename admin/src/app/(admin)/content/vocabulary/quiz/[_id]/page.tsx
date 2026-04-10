import { VocabularyQuizDetailMain } from '@/features/vocabulary'

export default async function page({ params }: { params: { _id: string } }) {
  const { _id } = await params
  return (
    <div>
      <VocabularyQuizDetailMain _id={_id} />
    </div>
  )
}
