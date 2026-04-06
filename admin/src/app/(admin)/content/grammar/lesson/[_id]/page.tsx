import { GrammarLessonMain } from '@/features/grammar'
import type { GrammarLessonDraft } from '@/features/grammar/types'
import { fetchServer } from '@/lib/apis/fetch-server'

export default async function GrammarLessonPage({ params }: { params: { _id: string } }) {
  const { _id } = await params
  const lessons = await fetchServer<GrammarLessonDraft>(`/grammar/${_id}`)

  return (
    <div>
      <GrammarLessonMain topic={lessons} />
    </div>
  )
}
