import { ListeningQuizDetailMain } from '@/features/listening'

export default async function Page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  return (
    <div>
      <ListeningQuizDetailMain _id={_id} />
    </div>
  )
}
