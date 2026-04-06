import { Speaking, SpeakingSubtitle } from '@/features/speaking/types'
import AuthorizedAxios from '@/lib/apis/authorizrAxios'

/** Shape response API (khớp lib/apis/api) */
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

/*=============== SPEAKING ADMIN ==============*/
export async function getSpeakingList(): Promise<ApiResponse<Speaking[]>> {
  const response = await AuthorizedAxios.get('/speaking/admin/legacy')
  return response.data as ApiResponse<Speaking[]>
}

export interface SpeakingPaginationMeta {
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

export interface PaginatedSpeakingResponse {
  success: boolean
  message: string
  data: Speaking[]
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
}

export interface SpeakingQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export async function getSpeakingListPaginated(
  params?: SpeakingQueryParams
): Promise<{ success: boolean; data: Speaking[]; pagination: SpeakingPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/speaking/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedSpeakingResponse

  const pagination: SpeakingPaginationMeta = {
    page: payload.pagination?.page || 1,
    limit: payload.pagination?.limit || 10,
    total: payload.pagination?.total || 0,
    pages: payload.pagination?.pages || 0,
    hasPrev: payload.pagination?.hasPrev || false,
    hasNext: payload.pagination?.hasNext || false,
    prev: payload.pagination?.prev || null,
    next: payload.pagination?.next || null,
  }

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination,
  }
}

export interface DataSpeaking {
  title: string
  description?: string
  videoUrl: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isActive?: boolean
}

export async function createSpeaking(data: DataSpeaking): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.post('/speaking/admin', data)
  return response.data as ApiResponse<Speaking>
}

export async function updateSpeakingStatus(id: string): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.put(`/speaking/admin/${id}/status`)
  return response.data as ApiResponse<Speaking>
}

export async function toggleSpeakingVipStatus(id: string): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.patch(`/speaking/admin/${id}/vip`)
  return response.data as ApiResponse<Speaking>
}

export async function swapSpeakingOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<ApiResponse<{ currentSpeaking: Speaking; swappedSpeaking: Speaking }>> {
  const response = await AuthorizedAxios.patch(`/speaking/admin/${id}/swap-order`, { direction })
  return response.data as ApiResponse<{ currentSpeaking: Speaking; swappedSpeaking: Speaking }>
}

export async function updateMultipleSpeakingStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ updatedCount: number; updatedSpeakings: Speaking[] }>> {
  const response = await AuthorizedAxios.put('/speaking/admin/bulk/status', {
    ids,
    isActive,
  })
  return response.data as ApiResponse<{ updatedCount: number; updatedSpeakings: Speaking[] }>
}

export async function updateSpeaking(id: string, data: DataSpeaking): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.put(`/speaking/admin/${id}`, data)
  return response.data as ApiResponse<Speaking>
}

export async function deleteSpeaking(id: string): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.delete(`/speaking/admin/${id}`)
  return response.data as ApiResponse<Speaking>
}

export async function deleteMultipleSpeaking(ids: string[]): Promise<ApiResponse<Speaking[]>> {
  const response = await AuthorizedAxios.delete(`/speaking/admin/multiple`, { data: { ids } })
  return response.data as ApiResponse<Speaking[]>
}

export async function getSpeakingById(id: string): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.get(`/speaking/admin/${id}`)
  return response.data as ApiResponse<Speaking>
}

/** Alias: chi tiết speaking kèm subtitle (populate) — dùng cùng endpoint GET admin/:id */
export async function getSpeakingWithSubtitles(id: string): Promise<ApiResponse<Speaking>> {
  return getSpeakingById(id)
}

/**
 * Cập nhật danh sách subtitle (body gửi kèm update speaking — backend cần hỗ trợ field `subtitles`).
 */
export async function updateSubtitles(
  speakingId: string,
  subtitles: SpeakingSubtitle[]
): Promise<ApiResponse<Speaking>> {
  const response = await AuthorizedAxios.put(`/speaking/admin/${speakingId}`, { subtitles })
  return response.data as ApiResponse<Speaking>
}

export async function exportSpeakingExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/speaking/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function importSpeakingJson(
  speakings: any[],
  skipErrors: boolean = false
): Promise<ApiResponse<any>> {
  const response = await AuthorizedAxios.post('/speaking/import-json', {
    speakings,
    skipErrors,
  })
  return response.data as ApiResponse<any>
}

/*=============== SPEAKING STATISTICS ==============*/
export interface SpeakingOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  avgSpeakingScore: number
  usersWithSpeakingScores: number
}

export interface SpeakingTopicStats {
  _id: string
  title: string
  description: string
  userCount: number
  completedCount: number
  completionRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SpeakingUserStats {
  totalUsers: number
  activeUsers: number
  avgCompletionRate: number
  topUsers: {
    _id: string
    fullName: string
    email: string
    speakingScore: number
    completedCount: number
  }[]
}

export interface SpeakingTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    avgScore: number
  }[]
  period: string
}

export async function getSpeakingOverviewStats(): Promise<ApiResponse<SpeakingOverviewStats>> {
  const response = await AuthorizedAxios.get('/speaking/overview')
  return response.data as ApiResponse<SpeakingOverviewStats>
}
