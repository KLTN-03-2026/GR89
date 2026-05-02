import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { ListeningQueryParams } from './api'
import { Listening } from '../types'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE CHO LISTENING
 *============================================================================*/

export async function getListeningListServer(params?: ListeningQueryParams): Promise<{
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
}> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/listening?${queryParams.toString()}`
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

export async function getListeningByIdServer(id: string): Promise<Listening | null> {
  const url = `/listening/${id}`
  const response = await fetchServer<any>(url)
  return response.data || null
}

export async function getListeningQuizzesServer(id: string): Promise<any[]> {
  const url = `/listening-quiz/admin/${id}`
  const response = await fetchServer<any>(url)
  return response.data || []
}
