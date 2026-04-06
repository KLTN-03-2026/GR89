import type { GrammarLessonDraft, LessonSection, PracticeQuestion, QuizQuestion, GrammarTopic } from '@/features/grammar/types'
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

/*================ GRAMMAR TOPIC MANAGEMENT ================*/
export async function getGrammarTopics(): Promise<Response<GrammarTopic[]>> {
  const res = await getGrammarTopicsPaginated({
    page: 1,
    limit: 1000,
    sortBy: 'orderIndex',
    sortOrder: 'asc'
  })
  return {
    success: res.success,
    data: res.data,
    pagination: res.pagination
  } as Response<GrammarTopic[]>
}

export async function getGrammarTopicById(id: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.get(`/grammar/${id}`)
  return response.data as Response<GrammarTopic>
}

export interface GrammarPaginationMeta {
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

export interface PaginatedGrammarResponse {
  success: boolean
  data: GrammarTopic[]
  pagination: {
    total: number
    limit: number
    pages: number
    page: number
    pagingCounter?: number
    hasPrev?: boolean
    hasNext?: boolean
    prev?: number | null
    next?: number | null
  }
}

export interface GrammarQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export async function getGrammarTopicsPaginated(
  params?: GrammarQueryParams
): Promise<{ success: boolean; data: GrammarTopic[]; pagination: GrammarPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/grammar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as unknown as PaginatedGrammarResponse

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination: (payload.pagination || {
      total: 0,
      limit: params?.limit || 10,
      pages: 0,
      page: params?.page || 1
    }) as GrammarPaginationMeta
  }
}

/** Import dữ liệu từ JSON */
export async function importGrammarJson(
  topics: any[],
  skipErrors: boolean = false
): Promise<Response<any>> {
  const response = await AuthorizedAxios.post('/grammar/import-json', {
    topics,
    skipErrors,
  })
  return response.data as Response<any>
}

export async function exportGrammarExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/grammar/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

interface DataCreateGrammarTopic {
  title: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export async function createGrammarTopic(data: DataCreateGrammarTopic): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post('/grammar', data)
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarTopic(id: string, data: DataCreateGrammarTopic): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/${id}`, data)
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarSections(id: string, sections: LessonSection[]): Promise<Response<GrammarLessonDraft>> {
  const response = await AuthorizedAxios.put(`/grammar/${id}/sections`, { sections })
  return response.data as Response<GrammarLessonDraft>
}

export async function updateGrammarPractice(id: string, practice: PracticeQuestion[]): Promise<Response<GrammarLessonDraft>> {
  const response = await AuthorizedAxios.put(`/grammar/${id}/practice`, { practice })
  return response.data as Response<GrammarLessonDraft>
}

export async function updateGrammarQuizzes(id: string, quizzes: QuizQuestion[]): Promise<Response<GrammarLessonDraft>> {
  const response = await AuthorizedAxios.put(`/grammar/${id}/quizzes`, { quizzes })
  return response.data as Response<GrammarLessonDraft>
}

export async function deleteGrammarTopic(id: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/${id}`)
  return response.data as Response<GrammarTopic>
}

export async function updateIsActiveGrammarTopic(id: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/${id}/status`)
  return response.data as Response<GrammarTopic>
}

export async function toggleGrammarTopicVipStatus(id: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.patch(`/grammar/${id}/vip`)
  return response.data as Response<GrammarTopic>
}

export async function swapGrammarTopicOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<Response<{ currentTopic: GrammarTopic; swappedTopic: GrammarTopic }>> {
  const response = await AuthorizedAxios.patch(`/grammar/${id}/swap-order`, { direction })
  return response.data as Response<{ currentTopic: GrammarTopic; swappedTopic: GrammarTopic }>
}

export async function deleteManyGrammarTopics(ids: string[]): Promise<Response<{ deletedCount: number; deletedTopics: GrammarTopic[] }>> {
  const response = await AuthorizedAxios.delete('/grammar/bulk-delete', { data: { ids } })
  return response.data as Response<{ deletedCount: number; deletedTopics: GrammarTopic[] }>
}

export async function updateManyGrammarTopicsStatus(
  ids: string[],
  isActive: boolean
): Promise<Response<{ updatedCount: number; updatedTopics: GrammarTopic[] }>> {
  const response = await AuthorizedAxios.put('/grammar/status', {
    ids,
    isActive
  })
  return response.data as Response<{ updatedCount: number; updatedTopics: GrammarTopic[] }>
}

export async function getGrammarTopicsByUser(): Promise<Response<GrammarTopic[]>> {
  const response = await AuthorizedAxios.get('/grammar/user')
  return response.data as Response<GrammarTopic[]>
}

/*=============== GRAMMAR LESSON MANAGEMENT ==============*/
export interface IGrammarStoryData {
  title: string
  story: string
  grammarPoints: string[]
  grammarQuestions: string[]
}
export async function createGrammarStory(topicId: string, data: IGrammarStoryData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/stories/${topicId}`, data)
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarStory(storyId: string, data: IGrammarStoryData, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/stories/${storyId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarStory(storyId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/stories/${storyId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

export interface IGrammarStructureData {
  structure: string
  explanation: string
  example: string
}

export async function createGrammarStructure(topicId: string, data: IGrammarStructureData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/structures`, { ...data, grammarId: topicId })
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarStructure(
  structureId: string,
  data: IGrammarStructureData,
  grammarId: string
): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/structures/${structureId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarStructure(structureId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/structures/${structureId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

export interface IGrammarUsageData {
  title: string
  description: string
  example: string
}

export async function createGrammarUsage(topicId: string, data: IGrammarUsageData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/usages`, { ...data, grammarId: topicId })
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarUsage(usageId: string, data: IGrammarUsageData, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/usages/${usageId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarUsage(usageId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/usages/${usageId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

export interface IGrammarTipData {
  title: string
  description: string
  example: string
}

export async function createGrammarTip(topicId: string, data: IGrammarTipData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/tips`, { ...data, grammarId: topicId })
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarTip(tipId: string, data: IGrammarTipData, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/tips/${tipId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarTip(tipId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/tips/${tipId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

export interface IGrammarInteractiveData {
  title: string
  description: string
  wrongSentence: string
  correctSentence: string
  explanation: string
}

export async function createGrammarInteractive(topicId: string, data: IGrammarInteractiveData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/interactives`, { ...data, grammarId: topicId })
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarInteractive(
  interactiveId: string,
  data: IGrammarInteractiveData,
  grammarId: string
): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/interactives/${interactiveId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarInteractive(interactiveId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/interactives/${interactiveId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

export interface IGrammarQuizData {
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options?: string[]
  answer: string
  explanation: string
}

export async function createGrammarQuiz(topicId: string, data: IGrammarQuizData): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.post(`/grammar/quizzes`, { ...data, grammarId: topicId })
  return response.data as Response<GrammarTopic>
}

export async function updateGrammarQuiz(quizId: string, data: IGrammarQuizData, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.put(`/grammar/quizzes/${quizId}`, { ...data, grammarId })
  return response.data as Response<GrammarTopic>
}

export async function deleteGrammarQuiz(quizId: string, grammarId: string): Promise<Response<GrammarTopic>> {
  const response = await AuthorizedAxios.delete(`/grammar/quizzes/${quizId}`, { data: { grammarId } })
  return response.data as Response<GrammarTopic>
}

/*=============== GRAMMAR STATISTICS ==============*/
export interface GrammarOverviewStats {
  totalLessons: number
  activeLessons: number
  totalUsers: number
  completionRate: number
  monthlyLearns: number
  monthlyChange: number
  completedProgressRecords: number
  totalProgressRecords: number
  totalTopics: number
}

export interface GrammarTopicStats {
  _id: string
  title: string
  description?: string
  progressCount: number
  completedCount: number
  completionRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GrammarUserStats {
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

export interface GrammarTimeSeriesStats {
  dailyStats: {
    _id: string
    totalProgress: number
    completedProgress: number
  }[]
  period: string
}

export async function getGrammarOverviewStats(): Promise<Response<GrammarOverviewStats>> {
  const response = await AuthorizedAxios.get('/grammar/overview')
  return response.data as Response<GrammarOverviewStats>
}

export async function getGrammarTopicStats(id: string): Promise<Response<GrammarTopicStats>> {
  const response = await AuthorizedAxios.get(`/grammar/${id}/stats`)
  return response.data as Response<GrammarTopicStats>
}

export async function getGrammarUserStats(): Promise<Response<GrammarUserStats>> {
  const response = await AuthorizedAxios.get('/grammar/user-stats')
  return response.data as Response<GrammarUserStats>
}

export async function getGrammarTimeSeriesStats(period: string = '30days'): Promise<Response<GrammarTimeSeriesStats>> {
  const response = await AuthorizedAxios.get(`/grammar/time-series?period=${period}`)
  return response.data as Response<GrammarTimeSeriesStats>
}
