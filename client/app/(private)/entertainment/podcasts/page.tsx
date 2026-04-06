import { PodcastsPage } from '@/features/entertainment'
import { getEntertainmentData } from '@/features/entertainment/services/entertainmentService'

export default async function page() {
  const { stats: podcastStats, items } = await getEntertainmentData('podcast')

  return (
    <PodcastsPage podcastStats={podcastStats} items={items} />
  )
}
