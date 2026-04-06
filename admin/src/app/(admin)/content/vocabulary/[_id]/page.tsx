import { VocabularyMain } from '@/features/vocabulary'

export default async function page({ params }: { params: { _id: string } }) {
  const { _id } = await params
  return (
    <VocabularyMain _id={_id} />
  )
}
