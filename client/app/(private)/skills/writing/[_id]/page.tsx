import { WritingLesson, getWritingLesson } from '@/features/writing'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const writingData = await getWritingLesson(_id)

  if (!writingData) return null

  return <WritingLesson writingData={writingData} />
}
