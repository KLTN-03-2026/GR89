import { GrammarPage, getGrammarData } from '@/features/grammar'

export default async function page() {
  const { overview, topics } = await getGrammarData()

  return <GrammarPage overview={overview} topics={topics} />
}