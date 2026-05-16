import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import type { Reading, ReadingOverviewStats } from '../types'
import type { ReadingQueryParams } from './api'

type ReadingPaginatedPayload = {
  readings?: Reading[]
  page?: number
  limit?: number
  total?: number
  pages?: number
  hasNext?: boolean
  hasPrev?: boolean
  next?: number | null
  prev?: number | null
}

export async function getReadingListServer(params?: ReadingQueryParams): Promise<{
  data: Reading[]
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

  const url = `/reading${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await fetchServer<ReadingPaginatedPayload>(url)
  const payload = response.data || {}

  return {
    data: payload.readings || [],
    pagination: {
      page: payload.page ?? params?.page ?? 1,
      limit: payload.limit ?? params?.limit ?? 10,
      total: payload.total ?? 0,
      pages: payload.pages ?? 0,
      hasNext: payload.hasNext ?? false,
      hasPrev: payload.hasPrev ?? false,
      next: payload.next ?? null,
      prev: payload.prev ?? null
    }
  }
}

export async function getReadingByIdServer(id: string): Promise<Reading | null> {
  const url = `/reading/${id}`
  const response = await fetchServer<Reading>(url)
  return response.data || null
}

export async function getReadingOverviewStatsServer(): Promise<ReadingOverviewStats | null> {
  const url = '/reading/overview'
  const response = await fetchServer<ReadingOverviewStats>(url)
  return response.data || null
}
