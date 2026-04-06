import { VocabularyLearning, getVocabularyTopic } from '@/features/vocabulary'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const topic = await getVocabularyTopic(_id)

  if (!topic) return null

  return <VocabularyLearning topic={topic} />
}
