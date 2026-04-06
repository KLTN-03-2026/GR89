import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { Listening } from '@/features/listening/types'

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

/*=============== LISTENING ==============*/
export async function getListeningList(): Promise<ApiResponse<Listening[]>> {
  const response = await AuthorizedAxios.get('/listening/legacy')
  return response.data as ApiResponse<Listening[]>
}

export interface ListeningPaginationMeta {
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

export interface PaginatedListeningResponse {
  success: boolean
  message: string
  data: Listening[]
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

export interface ListeningQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export async function getListeningListPaginated(
  params?: ListeningQueryParams
): Promise<{ success: boolean; data: Listening[]; pagination: ListeningPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/listening/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedListeningResponse

  const pagination: ListeningPaginationMeta = {
    page: payload.pagination?.page ?? params?.page ?? 1,
    limit: payload.pagination?.limit ?? params?.limit ?? 10,
    total: payload.pagination?.total || 0,
    pages: payload.pagination?.pages ?? 0,
    hasPrev: payload.pagination?.hasPrev ?? false,
    hasNext: payload.pagination?.hasNext ?? false,
    prev: payload.pagination?.prev ?? null,
    next: payload.pagination?.next ?? null,
  }

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination,
  }
}

export async function getListeningById(id: string): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.get(`/listening/${id}`)
  return response.data as ApiResponse<Listening>
}

interface DataListening {
  title: string
  description: string
  audio: string // media id
  subtitle: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export async function createListening(data: DataListening): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.post('/listening/create', data)
  return response.data as ApiResponse<Listening>
}

export async function updateListening(id: string, data: DataListening): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.put(`/listening/${id}`, data)
  return response.data as ApiResponse<Listening>
}

export async function deleteListening(id: string): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.delete(`/listening/${id}`)
  return response.data as ApiResponse<Listening>
}

export async function deleteMultipleListening(ids: string[]): Promise<ApiResponse<Listening[]>> {
  const response = await AuthorizedAxios.delete('/listening/', { data: { ids } })
  return response.data as ApiResponse<Listening[]>
}

export async function updateListeningStatus(id: string): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.put(`/listening/${id}/status`)
  return response.data as ApiResponse<Listening>
}

export async function toggleListeningVipStatus(id: string): Promise<ApiResponse<Listening>> {
  const response = await AuthorizedAxios.patch(`/listening/${id}/vip`)
  return response.data as ApiResponse<Listening>
}

export async function swapListeningOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<ApiResponse<{ currentListening: Listening; swappedListening: Listening }>> {
  const response = await AuthorizedAxios.patch(`/listening/${id}/swap-order`, { direction })
  return response.data as ApiResponse<{ currentListening: Listening; swappedListening: Listening }>
}

export async function updateMultipleListeningStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ updatedCount: number; updatedListenings: Listening[] }>> {
  const response = await AuthorizedAxios.put('/listening/bulk/status', {
    ids,
    isActive,
  })
  return response.data as ApiResponse<{ updatedCount: number; updatedListenings: Listening[] }>
}

/*=============== Listening export/import ==============*/
export async function exportListeningExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/listening/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function importListeningJson(
  listenings: any[],
  skipErrors: boolean = false
): Promise<ApiResponse<any>> {
  const response = await AuthorizedAxios.post('/listening/import-json', {
    listenings,
    skipErrors,
  })
  return response.data as ApiResponse<any>
}

/*=============== LISTENING STATISTICS ==============*/
export interface ListeningOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  completedProgressRecords: number
  totalProgressRecords: number
}

export interface ListeningTopicStats {
  _id: string
  title: string
  audioUrl: string
  progressCount: number
  completedCount: number
  completionRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ListeningUserStats {
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

export interface ListeningTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    completedProgress: number
    avgScore: number
  }[]
  period: string
}

export async function getListeningOverviewStats(): Promise<ApiResponse<ListeningOverviewStats>> {
  const response = await AuthorizedAxios.get('/listening/overview')
  return response.data as ApiResponse<ListeningOverviewStats>
}

