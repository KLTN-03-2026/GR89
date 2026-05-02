import { GrammarLessonMain } from '@/features/grammar'
import { getGrammarLessonByIdServer } from '@/features/grammar/services/serverApi'
import { notFound } from 'next/navigation'

export default async function GrammarLessonPage({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const topic = await getGrammarLessonByIdServer(_id)

  if (!topic) {
    notFound()
  }

  return (
    <div>
      <GrammarLessonMain topic={topic} />
    </div>
  )
}
