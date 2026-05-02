import { VocabularyMain } from '@/features/vocabulary'
import { getVocabularyByTopicIdServer } from '@/features/vocabulary/services/serverApi'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const response = await getVocabularyByTopicIdServer(_id)

  return (
    <VocabularyMain
      _id={_id}
      initialData={response.data}
    />
  )
}
