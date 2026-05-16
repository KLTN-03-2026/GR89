import { EntertainmentMain } from '@/features/entertainment'
import { getEntertainmentListServer, getEntertainmentStatsServer } from '@/features/entertainment/services/serverApi'
import type { EntertainmentStats } from '@/features/entertainment/services/api'
import type { Pagination } from '@/lib/apis/fetch-server'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    isActive?: string
  }>
}

export default async function PodcastPage({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    sortBy = 'orderIndex',
    sortOrder = 'asc',
    isActive
  } = await searchParams

  const [response, stats] = await Promise.all([
    getEntertainmentListServer({
      page: Number(page),
      limit: Number(limit),
      search,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      status: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      type: 'podcast'
    }),
    getEntertainmentStatsServer('podcast')
  ])

  return (
    <EntertainmentMain
      baseType="podcast"
      type="podcast"
      initialData={response.data}
      pagination={response.pagination as unknown as Pagination}
      initialStats={(stats || ({} as EntertainmentStats)) as EntertainmentStats}
    />
  )
}
