import { getListeningLesson, ListeningGistQuizPage } from '@/features/listening'

export default async function ListeningQuizPage({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const listening = await getListeningLesson(_id)

  if (!listening) return null

  return (
    <div className="max-w-5xl mx-auto">
      <ListeningGistQuizPage listening={listening} />
    </div>
  )
}

