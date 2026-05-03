import { Vocabulary, VocabularyResult, VocabularyTopic } from '@/features/vocabulary/types'
import { Quiz } from "@/types"
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

/*=============== VOCABULARY TOPIC ==============*/
export async function getVocabularyTopics(): Promise<ApiResponse<VocabularyTopic[]>> {
  const response = await AuthorizedAxios.get('/vocabulary/topics-admin-legacy')
  return response.data as ApiResponse<VocabularyTopic[]>
}

export interface VocabularyPaginationMeta {
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

export interface PaginatedVocabularyResponse {
  success: boolean
  message: string
  data: VocabularyTopic[]
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

export interface VocabularyQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export async function getVocabularyTopicsPaginated(
  params?: VocabularyQueryParams
): Promise<{ success: boolean; data: VocabularyTopic[]; pagination: VocabularyPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/vocabulary/topics-admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedVocabularyResponse

  const pagination: VocabularyPaginationMeta = {
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

export interface DataCreateVocabularyTopic {
  name: string
  image: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export async function createVocabularyTopic(
  data: DataCreateVocabularyTopic
): Promise<ApiResponse<VocabularyTopic>> {
  const response = await AuthorizedAxios.post('/vocabulary/create-topic', data)
  return response.data as ApiResponse<VocabularyTopic>
}

export async function deleteVocabularyTopic(id: string): Promise<ApiResponse<VocabularyTopic>> {
  const response = await AuthorizedAxios.delete(`/vocabulary/topic/${id}`)
  return response.data as ApiResponse<VocabularyTopic>
}

export async function deleteManyVocabularyTopics(
  ids: string[]
): Promise<ApiResponse<{ deletedCount: number; deletedTopics: VocabularyTopic[] }>> {
  const response = await AuthorizedAxios.post(`/vocabulary/topics/delete-many`, { ids })
  return response.data as ApiResponse<{ deletedCount: number; deletedTopics: VocabularyTopic[] }>
}

export async function updateManyVocabularyTopicsStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ updatedCount: number; updatedTopics: VocabularyTopic[] }>> {
  const response = await AuthorizedAxios.put('/vocabulary/topics/bulk/status', {
    ids,
    isActive,
  })
  return response.data as ApiResponse<{ updatedCount: number; updatedTopics: VocabularyTopic[] }>
}

export interface DataUpdateVocabularyTopic {
  name: string
  image: string
}

export async function updateVocabularyTopic(
  id: string,
  data: DataUpdateVocabularyTopic
): Promise<ApiResponse<VocabularyTopic>> {
  const response = await AuthorizedAxios.put(`/vocabulary/topic/${id}`, data)
  return response.data as ApiResponse<VocabularyTopic>
}

export async function updateIsActiveVocabularyTopic(id: string): Promise<ApiResponse<VocabularyTopic>> {
  const response = await AuthorizedAxios.put(`/vocabulary/topic/${id}/status`)
  return response.data as ApiResponse<VocabularyTopic>
}

export async function toggleVocabularyTopicVipStatus(id: string): Promise<ApiResponse<VocabularyTopic>> {
  const response = await AuthorizedAxios.patch(`/vocabulary/topic/${id}/vip`)
  return response.data as ApiResponse<VocabularyTopic>
}

export async function swapVocabularyTopicOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<ApiResponse<{ currentTopic: VocabularyTopic; swappedTopic: VocabularyTopic }>> {
  const response = await AuthorizedAxios.patch(`/vocabulary/topic/${id}/swap-order`, { direction })
  return response.data as ApiResponse<{ currentTopic: VocabularyTopic; swappedTopic: VocabularyTopic }>
}

/*=============== VOCABULARY ==============*/
export async function getVocabularyByTopicId(id: string): Promise<ApiResponse<VocabularyResult>> {
  const response = await AuthorizedAxios.get(`/vocabulary/${id}`)
  return response.data as ApiResponse<VocabularyResult>
}

export interface DataCreateVocabulary {
  word: string
  transcription: string
  partOfSpeech: string
  definition: string
  vietnameseMeaning: string
  example: string
  image: string
  vocabularyTopicId: string
}

export async function createVocabulary(data: DataCreateVocabulary): Promise<ApiResponse<Vocabulary>> {
  const response = await AuthorizedAxios.post('/vocabulary/create', data)
  return response.data as ApiResponse<Vocabulary>
}

export interface DataUpdateVocabulary {
  word: string
  transcription: string
  partOfSpeech: string
  definition: string
  vietnameseMeaning: string
  example: string
  image: string
  vocabularyTopicId: string
}

export async function updateVocabulary(
  id: string,
  data: DataUpdateVocabulary
): Promise<ApiResponse<Vocabulary>> {
  const response = await AuthorizedAxios.put(`/vocabulary/${id}`, data)
  return response.data as ApiResponse<Vocabulary>
}

export async function toggleVocabularyVipStatus(id: string): Promise<ApiResponse<Vocabulary>> {
  const response = await AuthorizedAxios.patch(`/vocabulary/${id}/vip`)
  return response.data as ApiResponse<Vocabulary>
}

export async function deleteVocabulary(id: string): Promise<ApiResponse<Vocabulary>> {
  const response = await AuthorizedAxios.delete(`/vocabulary/${id}`)
  return response.data as ApiResponse<Vocabulary>
}

export async function deleteManyVocabularies(
  ids: string[]
): Promise<ApiResponse<{ deletedCount: number }>> {
  const response = await AuthorizedAxios.post(`/vocabulary/delete-many`, { ids })
  return response.data as ApiResponse<{ deletedCount: number }>
}

/*=============== VOCABULARY TOPIC QUIZZES ==============*/
export async function getVocabularyQuizzesByTopic(id: string): Promise<ApiResponse<Quiz[]>> {
  const response = await AuthorizedAxios.get(`/vocabulary/${id}/quiz`)
  return response.data as ApiResponse<Quiz[]>
}

export interface IDataCreateVocabularyQuiz {
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options?: string[]
  answer: string
  explanation: string
}

export async function createVocabularyQuiz(
  topicId: string,
  data: IDataCreateVocabularyQuiz
): Promise<ApiResponse<Quiz>> {
  const response = await AuthorizedAxios.post(`/vocabulary/${topicId}/quiz`, data)
  return response.data as ApiResponse<Quiz>
}

export async function deleteVocabularyQuiz(
  topicId: string,
  quizId: string
): Promise<ApiResponse<Quiz>> {
  const response = await AuthorizedAxios.delete(`/vocabulary/${topicId}/quiz/${quizId}`)
  return response.data as ApiResponse<Quiz>
}

/** Cập nhật quiz (endpoint global admin) */
export interface IDataUpdateQuiz {
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options?: string[]
  answer: string
  explanation: string
}

export async function updateQuiz(quizId: string, data: IDataUpdateQuiz): Promise<ApiResponse<Quiz>> {
  const response = await AuthorizedAxios.put(`/quiz/update/${quizId}`, data)
  return response.data as ApiResponse<Quiz>
}

/*=============== IMPORT / EXPORT ==============*/
export async function importVocabularyJson(
  topics: VocabularyTopic[],
  skipErrors: boolean = false
): Promise<ApiResponse<VocabularyTopic[]>> {
  const response = await AuthorizedAxios.post('/vocabulary/import-json', {
    topics,
    skipErrors,
  })
  return response.data as ApiResponse<VocabularyTopic[]>
}

export async function exportVocabularyExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/vocabulary/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/*=============== VOCABULARY STATISTICS ==============*/
export interface VocabularyOverviewStats {
  totalTopics: number
  activeTopics: number
  totalWords: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  completedProgressRecords: number
  totalProgressRecords: number
}

export interface VocabularyTopicStats {
  _id: string
  name: string
  image: string
  wordsCount: number
  progressCount: number
  completedCount: number
  completionRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VocabularyUserStats {
  totalUsers: number
  activeUsers: number
  avgCompletionRate: number
  topUsers: {
    _id: string
    fullName: string
    email: string
    completionRate: number
    completedCount: number
    totalCount: number
  }[]
}

export interface VocabularyTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    completedProgress: number
  }[]
  period: string
}

export async function getVocabularyOverviewStats(): Promise<ApiResponse<VocabularyOverviewStats>> {
  const response = await AuthorizedAxios.get('/vocabulary/overview-admin')
  return response.data as ApiResponse<VocabularyOverviewStats>
}
