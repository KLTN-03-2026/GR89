import { ListVocabularyLesson, getVocabularyTopic } from '@/features/vocabulary'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const topic = await getVocabularyTopic(_id)

  if (!topic || !topic.vocabularies || topic.vocabularies.length === 0) {
    return null
  }

  return <ListVocabularyLesson topic={topic} />
}
