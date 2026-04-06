import { Writing } from '../types'
import AuthorizedAxios from '@/lib/apis/authorizrAxios'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
    next?: number | null
    prev?: number | null
  }
}

export interface WritingPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  pagingCounter?: number
  hasPrev?: boolean
  hasNext?: boolean
  prev?: number | null
  next?: number | null
}

export interface PaginatedWritingResponse {
  success: boolean
  message: string
  data: Writing[]
  total: number
  limit: number
  pages: number
  page: number
  pagingCounter: number
  hasPrev: boolean
  hasNext: boolean
  prev: number | null
  next: number | null
}

export interface WritingQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export interface WritingPayload {
  title: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  minWords: number
  maxWords: number
  duration: number
  suggestedVocabulary: string[]
  suggestedStructure: {
    title?: string
    description?: string
    step?: number
  }[]
}

export interface WritingOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  avgWritingScore: number
  completedProgressRecords: number
  totalProgressRecords: number
}

export interface WritingTopicStats {
  _id: string
  title: string
  prompt: string
  progressCount: number
  completedCount: number
  completionRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WritingUserStats {
  totalUsers: number
  activeUsers: number
  avgCompletionRate: number
  topUsers: {
    _id: string
    fullName: string
    email: string
    avgScore: number
    completedCount: number
    totalCount: number
  }[]
}

export interface WritingTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    completedProgress: number
    avgScore: number
  }[]
  period: string
}

export async function getWritingList(): Promise<ApiResponse<Writing[]>> {
  const response = await AuthorizedAxios.get('/writing/legacy')
  return response.data as ApiResponse<Writing[]>
}

export async function getWritingListPaginated(
  params?: WritingQueryParams
): Promise<{ success: boolean; data: Writing[]; pagination: WritingPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/writing/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedWritingResponse

  const pagination: WritingPaginationMeta = {
    page: payload.page ?? params?.page ?? 1,
    limit: payload.limit ?? params?.limit ?? 10,
    total: payload.total ?? 0,
    pages: payload.pages ?? 0,
    hasPrev: payload.hasPrev ?? false,
    hasNext: payload.hasNext ?? false,
    prev: payload.prev ?? null,
    next: payload.next ?? null,
  }

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination,
  }
}

export async function createWriting(data: WritingPayload): Promise<ApiResponse<Writing>> {
  const response = await AuthorizedAxios.post('/writing/create', data)
  return response.data as ApiResponse<Writing>
}

export async function updateWritingStatus(id: string): Promise<ApiResponse<Writing>> {
  const response = await AuthorizedAxios.put(`/writing/${id}/status`)
  return response.data as ApiResponse<Writing>
}

export async function toggleWritingVipStatus(id: string): Promise<ApiResponse<Writing>> {
  const response = await AuthorizedAxios.patch(`/writing/${id}/vip`)
  return response.data as ApiResponse<Writing>
}

export async function swapWritingOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<ApiResponse<{ currentWriting: Writing; swappedWriting: Writing }>> {
  const response = await AuthorizedAxios.patch(`/writing/${id}/swap-order`, { direction })
  return response.data as ApiResponse<{ currentWriting: Writing; swappedWriting: Writing }>
}

export async function updateMultipleWritingStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ updatedCount: number; updatedWritings: Writing[] }>> {
  const response = await AuthorizedAxios.put('/writing/bulk/status', {
    ids,
    isActive,
  })
  return response.data as ApiResponse<{ updatedCount: number; updatedWritings: Writing[] }>
}

export async function updateWriting(id: string, data: WritingPayload): Promise<ApiResponse<Writing>> {
  const response = await AuthorizedAxios.put(`/writing/${id}`, data)
  return response.data as ApiResponse<Writing>
}

export async function deleteWriting(id: string): Promise<ApiResponse<Writing>> {
  const response = await AuthorizedAxios.delete(`/writing/${id}`)
  return response.data as ApiResponse<Writing>
}

export async function deleteMultipleWriting(ids: string[]): Promise<ApiResponse<Writing[]>> {
  const response = await AuthorizedAxios.delete(`/writing/`, { data: { ids } })
  return response.data as ApiResponse<Writing[]>
}

export async function exportWritingExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/writing/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function importWritingData(
  file: File,
  skipErrors: boolean = false
): Promise<ApiResponse<Writing[]>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipErrors', String(skipErrors))
  const response = await AuthorizedAxios.post('/writing/import', formData)
  return response.data as ApiResponse<Writing[]>
}

export async function importWritingJson(
  writings: any[],
  skipErrors: boolean = false
): Promise<ApiResponse<any>> {
  const response = await AuthorizedAxios.post('/writing/import-json', {
    writings,
    skipErrors,
  })
  return response.data as ApiResponse<any>
}

export async function getWritingOverviewStats(): Promise<ApiResponse<WritingOverviewStats>> {
  const response = await AuthorizedAxios.get('/writing/overview')
  return response.data as ApiResponse<WritingOverviewStats>
}
