import { VocabularyPage, getVocabularyData } from '@/features/vocabulary'

export default async function page() {
  const { overview, topics } = await getVocabularyData()

  return <VocabularyPage overview={overview} topics={topics} />
}
