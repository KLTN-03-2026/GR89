import { EntertainmentMain } from '@/features/entertainment'
import { getEntertainmentByIdServer, getEntertainmentListServer, getEntertainmentStatsServer } from '@/features/entertainment/services/serverApi'
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
    parentId?: string
  }>
}

export default async function MoviePage({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    sortBy = 'orderIndex',
    sortOrder = 'asc',
    isActive,
    parentId
  } = await searchParams

  const viewType = parentId ? 'episode' : 'movie'

  const [response, stats, parent] = await Promise.all([
    getEntertainmentListServer({
      page: Number(page),
      limit: Number(limit),
      search,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      status: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      type: viewType,
      parentId
    }),
    getEntertainmentStatsServer(viewType),
    parentId ? getEntertainmentByIdServer(parentId) : Promise.resolve(null)
  ])

  return (
    <EntertainmentMain
      baseType="movie"
      type={viewType}
      parentId={parentId}
      parentTitle={parent?.title || ''}
      initialData={response.data}
      pagination={response.pagination as unknown as Pagination}
      initialStats={(stats || ({} as EntertainmentStats)) as EntertainmentStats}
    />
  )
}
