import { GrammarLessonFlow } from '@/features/grammar'
import { getGrammarLesson } from '@/features/grammar/services/grammarService'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const lesson = await getGrammarLesson(_id)
  return <GrammarLessonFlow lesson={lesson} topicId={_id} />
}
