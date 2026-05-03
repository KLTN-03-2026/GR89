import { ListeningQuizDetailMain } from '@/features/listening'
import { getListeningByIdServer, getListeningQuizzesServer } from '@/features/listening/services/serverApi'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const [listening, quizzes] = await Promise.all([
    getListeningByIdServer(_id),
    getListeningQuizzesServer(_id)
  ])

  if (!listening) {
    notFound()
  }

  return (
    <div>
      <ListeningQuizDetailMain
        _id={_id}
        initialListening={listening}
        initialQuizzes={quizzes}
      />
    </div>
  )
}
