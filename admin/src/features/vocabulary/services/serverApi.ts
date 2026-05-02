import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { VocabularyQueryParams } from './api'
import { VocabularyTopic } from '../types'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE CHO VOCABULARY
 *============================================================================*/

export async function getVocabularyTopicsServer(params?: VocabularyQueryParams): Promise<{
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
}> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/vocabulary/topics-admin?${queryParams.toString()}`
  const response = await fetchServer<any>(url)

  return {
    data: response.data || [],
    pagination: response.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false,
      next: null,
      prev: null
    }
  }
}

export async function getVocabularyByTopicIdServer(id: string): Promise<{
  data: VocabularyTopic | null
}> {
  const url = `/vocabulary/topic-admin/${id}`
  const response = await fetchServer<any>(url)

  return {
    data: response.data || null
  }
}
