import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import type { Writing } from '../types'
import type { WritingOverviewStats, WritingQueryParams } from './api'

type WritingListPayload = {
  data?: Writing[]
  total?: number
  limit?: number
  page?: number
  pages?: number
  hasNext?: boolean
  hasPrev?: boolean
  next?: number | null
  prev?: number | null
}

export async function getWritingListServer(params?: WritingQueryParams): Promise<{
  data: Writing[]
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
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/writing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = (await fetchServer<Writing[]>(url)) as unknown as WritingListPayload

  return {
    data: response.data || [],
    pagination: {
      page: response.page ?? params?.page ?? 1,
      limit: response.limit ?? params?.limit ?? 10,
      total: response.total ?? 0,
      pages: response.pages ?? 0,
      hasNext: response.hasNext ?? false,
      hasPrev: response.hasPrev ?? false,
      next: response.next ?? null,
      prev: response.prev ?? null
    }
  }
}

export async function getWritingByIdServer(id: string): Promise<Writing | null> {
  const url = `/writing/${id}`
  const response = await fetchServer<Writing>(url)
  return response.data || null
}

export async function getWritingOverviewStatsServer(): Promise<WritingOverviewStats | null> {
  const url = '/writing/overview'
  const response = await fetchServer<WritingOverviewStats>(url)
  return response.data || null
}
