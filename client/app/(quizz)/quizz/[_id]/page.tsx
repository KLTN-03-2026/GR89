import { Quizz, IQuiz } from "@/features/quizz"
import { fetchServer } from '@/libs/apis/fetch-server'

export default async function page({ params, searchParams }: {
  params: Promise<{ _id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { _id } = await params
  const { type } = await searchParams
  const safeType: 'vocabulary' | 'reading' | 'grammar' =
    type === 'reading' || type === 'grammar' || type === 'vocabulary'
      ? type
      : 'vocabulary'

  let endpoint = ''
  switch (safeType) {
    case 'vocabulary':
      endpoint = `/vocabulary/${_id}/quiz/user`
      break
    case 'grammar':
      endpoint = `/grammar/topic-user/${_id}/quizzes`
      break
    case 'reading':
      endpoint = `/reading/${_id}/quiz`
      break
    default:
      endpoint = `/vocabulary/${_id}/quiz/user`
  }

  const response = await fetchServer<IQuiz[]>(endpoint)
  const quizzes = Array.isArray(response) ? response : []
  return (
    <Quizz _id={_id} type={safeType} quizzes={quizzes} />
  )
}
