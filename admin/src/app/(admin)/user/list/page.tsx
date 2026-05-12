import { UserMain } from '@/features/user'
import { fetchServer } from '@/lib/apis/fetch-server'
import type { User } from '@/features/user/types'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    isActive?: string
    roleFilter?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isActive,
    roleFilter,
  } = await searchParams

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(Math.max(1, Number(page) || 1)))
  queryParams.set('limit', String([5, 10, 20, 50].includes(Number(limit)) ? Number(limit) : 10))
  if (search) queryParams.set('search', search)
  if (sortBy) queryParams.set('sortBy', sortBy)
  if (sortOrder) queryParams.set('sortOrder', sortOrder)
  if (isActive === 'true') queryParams.set('isActive', 'true')
  if (isActive === 'false') queryParams.set('isActive', 'false')
  if (roleFilter && roleFilter !== 'all') queryParams.set('role', roleFilter)

  const response = await fetchServer<User[]>(`/user?${queryParams.toString()}`)

  return (
    <div>
      <UserMain
        initialData={response.data || []}
        pagination={
          response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false,
            next: null,
            prev: null,
          }
        }
      />
    </div>
  )
}
