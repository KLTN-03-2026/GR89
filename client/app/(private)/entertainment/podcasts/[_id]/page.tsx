import { EntertainmentDetail } from '@/features/entertainment'
import { getEntertainmentDetail } from '@/features/entertainment/services/entertainmentService'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params
  const detail = await getEntertainmentDetail(_id)

  if (!detail) return null

  return (
    <div className="max-w-7xl mx-auto p-4">
      <EntertainmentDetail detail={detail} />
    </div>
  )
}
