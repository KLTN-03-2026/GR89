import { MusicsPage } from '@/features/entertainment'
import { getEntertainmentData } from '@/features/entertainment/services/entertainmentService'

export default async function page() {
  const { stats: musicStats, items } = await getEntertainmentData('music')

  return (
    <MusicsPage musicStats={musicStats} items={items} />
  )
}
