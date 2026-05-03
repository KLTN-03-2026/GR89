import { ResultListening, getListeningResult } from '@/features/listening'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const result = await getListeningResult(_id)

  return <ResultListening result={result} />
}
