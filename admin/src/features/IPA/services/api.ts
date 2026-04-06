import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { Ipa } from '@/features/IPA/types'

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

/*=============== IPA ==============*/

export interface IPAPaginationMeta {
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

export interface IPAQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'sound' | 'soundType' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  soundType?: 'vowel' | 'consonant' | 'diphthong'
  createdBy?: string
  isActive?: boolean
}

export interface PaginatedIPAResponse {
  success: boolean
  message: string
  data: Ipa[]
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

export async function getAllIPA(
  params?: IPAQueryParams
): Promise<{ success: boolean; data: Ipa[]; pagination: IPAPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.soundType) queryParams.append('soundType', params.soundType)
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/ipa/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedIPAResponse

  const pagination: IPAPaginationMeta = {
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

export interface IIpaCreateData {
  sound: string
  soundType: 'vowel' | 'consonant' | 'diphthong'
  image: string
  video?: string
  description: string
}

export async function createIpa(data: IIpaCreateData): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.post('/ipa/', data)
  return response.data as ApiResponse<Ipa>
}

export interface IIpaUpdateData {
  sound: string
  soundType: 'vowel' | 'consonant' | 'diphthong'
  image: string
  video?: string
  description: string
}

export async function updateIpa(id: string, data: IIpaUpdateData): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.put(`/ipa/${id}`, data)
  return response.data as ApiResponse<Ipa>
}

export async function deleteIpa(id: string): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.delete(`/ipa/${id}`)
  return response.data as ApiResponse<Ipa>
}

export async function deleteManyIpa(ids: string[]): Promise<ApiResponse<{ deletedCount: number; deletedIpas: Ipa[] }>> {
  const response = await AuthorizedAxios.post('/ipa/delete-many', { ids })
  return response.data as ApiResponse<{ deletedCount: number; deletedIpas: Ipa[] }>
}

export async function updateIpaStatus(id: string): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.put(`/ipa/${id}/status`)
  return response.data as ApiResponse<Ipa>
}

export async function toggleIpaVipStatus(id: string): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.patch(`/ipa/${id}/vip`)
  return response.data as ApiResponse<Ipa>
}

export async function swapIpaOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<ApiResponse<{ currentIpa: Ipa; swappedIpa: Ipa }>> {
  const response = await AuthorizedAxios.patch(`/ipa/${id}/swap-order`, { direction })
  return response.data as ApiResponse<{ currentIpa: Ipa; swappedIpa: Ipa }>
}

export async function updateManyIpaStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ updatedCount: number; updatedIpas: Ipa[] }>> {
  const response = await AuthorizedAxios.put('/ipa/bulk/status', {
    ids,
    isActive,
  })
  return response.data as ApiResponse<{ updatedCount: number; updatedIpas: Ipa[] }>
}

export async function getIpaById(id: string): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.get(`/ipa/${id}`)
  return response.data as ApiResponse<Ipa>
}

/*=============== IPA Examples ==============*/

export interface IIpaExample {
  word: string
  phonetic: string
  vietnamese: string
}

export async function addExampleIpa(ipaId: string, example: IIpaExample): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.post(`/ipa/${ipaId}/example`, { example })
  return response.data as ApiResponse<Ipa>
}

export async function updateExampleIpa(
  ipaId: string,
  exampleId: string,
  example: IIpaExample
): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.put(`/ipa/${ipaId}/example`, { exampleId, example })
  return response.data as ApiResponse<Ipa>
}

export async function deleteExampleIpa(ipaId: string, exampleId: string): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.delete(`/ipa/${ipaId}/example`, { data: { exampleId } })
  return response.data as ApiResponse<Ipa>
}

export async function deleteMultipleExamplesIpa(
  ipaId: string,
  exampleIds: string[]
): Promise<ApiResponse<Ipa>> {
  const response = await AuthorizedAxios.delete(`/ipa/${ipaId}/examples`, { data: { exampleIds } })
  return response.data as ApiResponse<Ipa>
}

/*=============== IPA export/import ==============*/

export async function importIpaJson(ipas: any[], skipErrors: boolean = false): Promise<ApiResponse<any>> {
  const response = await AuthorizedAxios.post('/ipa/import-json', {
    ipas,
    skipErrors,
  })
  return response.data as ApiResponse<any>
}

export async function exportIpaExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/ipa/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/*=============== IPA STATISTICS ==============*/

export interface IpaOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  completedProgressRecords: number
  totalProgressRecords: number
}

export interface IpaCategoryStats {
  category: string
  totalLessons: number
  progressCount: number
  completedCount: number
  completionRate: number
}

export interface IpaUserStats {
  totalUsers: number
  activeUsers: number
  avgCompletionRate: number
  topUsers: {
    _id: string
    fullName: string
    email: string
    avgProgress: number
    completedCount: number
    totalCount: number
  }[]
}

export interface IpaTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    avgProgress: number
  }[]
  period: string
}

export async function getIpaOverviewStats(): Promise<ApiResponse<IpaOverviewStats>> {
  const response = await AuthorizedAxios.get('/ipa/overview')
  return response.data as ApiResponse<IpaOverviewStats>
}

