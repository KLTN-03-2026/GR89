import { ListeningLesson, getListeningLesson } from '@/features/listening'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const listening = await getListeningLesson(_id)

  if (!listening) return null

  return (
    <div className='max-w-7xl mx-auto'>
      <ListeningLesson listening={listening} />
    </div>
  )
}
