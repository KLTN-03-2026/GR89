import { getReadingLesson } from '@/features/reading/services/readingService'
import { ReadingLessonClient } from '@/features/reading/components/lesson/ReadingLessonClient'
import { notFound } from 'next/navigation'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const reading = await getReadingLesson(_id)

  if (!reading) {
    notFound()
  }

  return <ReadingLessonClient reading={reading} />
}
