import { DataReading, Reading, ReadingOverviewStats } from "../types"
import AuthorizedAxios from '@/lib/apis/authorizrAxios'

interface Response<T> {
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

//get reading list
export async function getReadingList(): Promise<Response<Reading[]>> {
  const response = await AuthorizedAxios.get('/reading/legacy')
  return response.data as Response<Reading[]>
}

// Add: Reading pagination types and API using server-side pagination
export interface ReadingPaginationMeta {
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

export interface PaginatedReadingResponse {
  success: boolean
  message: string
  readings: Reading[]  // Changed from data to readings
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

export interface ReadingQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

// Reading Stats API Functions
export async function getReadingOverviewStats(): Promise<Response<ReadingOverviewStats>> {
  const response = await AuthorizedAxios.get('/reading/overview')
  return response.data as Response<ReadingOverviewStats>
}

// reading export/import
export async function exportReadingExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/reading/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function importReadingJson(readings: any[], skipErrors: boolean = false): Promise<Response<any>> {
  const response = await AuthorizedAxios.post('/reading/import-json', {
    readings,
    skipErrors,
  })
  return response.data as Response<any>
}

/*=============== READING STATISTICS ==============*/

// Returns a normalized structure { success, data: Reading[], pagination }
export async function getReadingListPaginated(params?: ReadingQueryParams): Promise<{ success: boolean; data: Reading[]; pagination: ReadingPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/reading/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data.data as PaginatedReadingResponse

  // Map backend response to frontend format
  const pagination: ReadingPaginationMeta = {
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
    data: payload.readings || [],
    pagination,
  }
}

// get reading by id
export async function getReadingById(id: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.get(`/reading/${id}`)
  return response.data as Response<Reading>
}

export async function createReading(data: DataReading): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.post('/reading/create', data)
  return response.data as Response<Reading>
}

// update reading status
export async function updateReadingStatus(id: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.put(`/reading/${id}/status`)
  return response.data as Response<Reading>
}

// Toggle Reading VIP status
export async function toggleReadingVipStatus(id: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.patch(`/reading/${id}/vip`)
  return response.data as Response<Reading>
}

// Swap Reading Order (Up/Down)
export async function swapReadingOrder(id: string, direction: 'up' | 'down'): Promise<Response<{ currentReading: Reading; swappedReading: Reading }>> {
  const response = await AuthorizedAxios.patch(`/reading/${id}/swap-order`, { direction })
  return response.data as Response<{ currentReading: Reading; swappedReading: Reading }>
}

// update status for many reading items
export async function updateMultipleReadingStatus(ids: string[], isActive: boolean): Promise<Response<{ updatedCount: number; updatedReadings: Reading[] }>> {
  const response = await AuthorizedAxios.put('/reading/bulk/status', {
    ids,
    isActive
  })
  return response.data as Response<{ updatedCount: number; updatedReadings: Reading[] }>
}

// update reading
export async function updateReading(id: string, data: DataReading): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.put(`/reading/update/${id}`, data)
  return response.data as Response<Reading>
}

// delete reading
export async function deleteReading(id: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.delete(`/reading/delete/${id}`)
  return response.data as Response<Reading>
}

// delete multiple reading
export async function deleteMultipleReading(ids: string[]): Promise<Response<Reading[]>> {
  const response = await AuthorizedAxios.delete(`/reading/delete-multiple`, { data: { ids } })
  return response.data as Response<Reading[]>
}

// Reading Quiz CRUD within a reading
export async function createReadingQuiz(readingId: string, quiz: {
  question: string
  type: "Multiple Choice" | "Fill in the blank"
  options?: string[]
  answer: string
  explanation: string
}): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.post(`/reading/create-quiz/${readingId}`, { quiz })
  return response.data as Response<Reading>
}

export async function deleteReadingQuiz(readingId: string, quizId: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.delete(`/reading/delete-quiz/${readingId}`, { data: { quizId } })
  return response.data as Response<Reading>
}

// Reading Vocabulary CRUD within a reading
export interface IReadingVocabularyPayload {
  word: string
  phonetic: string
  definition: string
  vietnamese: string
  example: string
}

export async function createReadingVocabulary(readingId: string, vocabulary: IReadingVocabularyPayload): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.post(`/reading/create-vocabulary/${readingId}`, { vocabulary })
  return response.data as Response<Reading>
}

export async function updateReadingVocabulary(readingId: string, vocabularyId: string, vocabulary: IReadingVocabularyPayload): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.put(`/reading/update-vocabulary/${readingId}`, { vocabularyId, vocabulary })
  return response.data as Response<Reading>
}

export async function deleteReadingVocabulary(readingId: string, vocabularyId: string): Promise<Response<Reading>> {
  const response = await AuthorizedAxios.delete(`/reading/delete-vocabulary/${readingId}`, { data: { vocabularyId } })
  return response.data as Response<Reading>
}