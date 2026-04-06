import { WritingPage, getWritingData } from '@/features/writing'

export default async function page() {
  const { overview, topics } = await getWritingData()

  return <WritingPage overview={overview} topics={topics} />
}
