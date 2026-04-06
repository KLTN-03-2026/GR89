import { MoviesPage } from '@/features/entertainment'
import { getEntertainmentData } from '@/features/entertainment/services/entertainmentService'

export default async function page() {
  const { stats: movieStats, items } = await getEntertainmentData('movie')

  return (
    <MoviesPage movieStats={movieStats} items={items} />
  )
}
