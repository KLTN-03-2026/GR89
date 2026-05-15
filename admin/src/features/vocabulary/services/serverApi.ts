import 'server-only'
import { ApiResponse, fetchServer } from '@/lib/apis/fetch-server'
import { VocabularyQueryParams } from './api'
import { VocabularyTopic } from '../types'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE CHO VOCABULARY
 *============================================================================*/

export async function getVocabularyTopicsServer(params?: VocabularyQueryParams): Promise<ApiResponse<VocabularyTopic[]>> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/vocabulary/topics-admin?${queryParams.toString()}`
  const response = await fetchServer<VocabularyTopic[]>(url)

  return response as ApiResponse<VocabularyTopic[]>
}

export async function getVocabularyByTopicIdServer(id: string): Promise<ApiResponse<VocabularyTopic>> {
  const url = `/vocabulary/${id}`
  const response = await fetchServer<VocabularyTopic>(url)

  return response as ApiResponse<VocabularyTopic>
}
