import { ResultPage } from '@/features/result'
import { fetchServer } from '@/libs/apis/fetch-server'
import { IQuizResult } from '@/features/quizz'

export default async function page({
  params,
  searchParams
}: {
  params: Promise<{ _id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { _id } = await params
  const { type } = await searchParams
  const resultType = (type as 'vocabulary' | 'reading' | 'grammar') || 'vocabulary'

  let endpoint = ''
  switch (resultType) {
    case 'vocabulary':
      endpoint = `/vocabulary/${_id}/result`
      break
    case 'reading':
      endpoint = `/reading/${_id}/result`
      break
    case 'grammar':
      endpoint = `/grammar/quizzes/${_id}/result`
      break
    default:
      endpoint = `/vocabulary/${_id}/result`
  }

  const response = await fetchServer<IQuizResult[]>(endpoint)

  return (
    <div className="m-auto mt-5 h-full p-5 max-w-4xl overflow-auto">
      <ResultPage _id={_id} type={resultType} results={response} />
    </div>
  )
}
