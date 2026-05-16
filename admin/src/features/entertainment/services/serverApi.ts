import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import type { Entertainment, EntertainmentPaginationMeta, EntertainmentStats } from './api'

export type EntertainmentQueryParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: boolean
  createdBy?: string
  type?: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  parentId?: string
}

export async function getEntertainmentListServer(params?: EntertainmentQueryParams): Promise<{
  data: Entertainment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    next: number | null
    prev: number | null
  }
}> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.status !== undefined) queryParams.append('status', String(params.status))
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)
  if (params?.type) queryParams.append('type', params.type)
  if (params?.parentId) queryParams.append('parentId', params.parentId)

  const url = `/entertainment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await fetchServer<Entertainment[]>(url)

  return {
    data: response.data || [],
    pagination: (response.pagination ||
      ({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
        next: null,
        prev: null
      } as EntertainmentPaginationMeta)) as unknown as {
      page: number
      limit: number
      total: number
      pages: number
      hasNext: boolean
      hasPrev: boolean
      next: number | null
      prev: number | null
    }
  }
}

export async function getEntertainmentByIdServer(id: string): Promise<Entertainment | null> {
  const url = `/entertainment/${id}`
  const response = await fetchServer<Entertainment>(url)
  return response.data || null
}

export async function getEntertainmentStatsServer(type?: string): Promise<EntertainmentStats | null> {
  const query = type ? `?type=${encodeURIComponent(type)}` : ''
  const url = `/entertainment/overview${query}`
  const response = await fetchServer<EntertainmentStats>(url)
  return response.data || null
}
