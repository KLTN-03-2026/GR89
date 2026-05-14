import { ListMediaVideo } from '@/features/Media'
import { fetchServer } from '@/lib/apis/fetch-server'
import { Media } from '@/features/Media/types'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const { page = '1', limit = '12' } = await searchParams

  const query = new URLSearchParams()
  query.append('type', 'video')
  query.append('sortBy', 'createdAt')
  query.append('sortOrder', 'desc')
  query.append('page', String(Math.max(1, Number(page) || 1)))
  query.append('limit', String(Math.max(1, Number(limit) || 12)))

  const response = await fetchServer<Media[]>(`/media?${query.toString()}`)

  return (
    <ListMediaVideo
      initialData={response.data || []}
      pagination={response.pagination || { page: 1, limit: 12, total: 0, pages: 0, hasNext: false, hasPrev: false, next: null, prev: null }}
    />
  )
}
