import 'server-only'
import { ApiResponse, fetchServer } from '@/lib/apis/fetch-server'
import { ListeningQueryParams, ListeningQuizDoc } from './api'
import { Listening } from '../types'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE CHO LISTENING
 *============================================================================*/

export async function getListeningListServer(params?: ListeningQueryParams): Promise<ApiResponse<Listening[]>> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/listening?${queryParams.toString()}`
  const response = await fetchServer<Listening[]>(url)

  return response as ApiResponse<Listening[]>
}

export async function getListeningByIdServer(id: string): Promise<Listening | null> {
  const url = `/listening/${id}`
  const response = await fetchServer<Listening>(url)
  return response.data || null
}

export async function getListeningQuizzesServer(id: string): Promise<ListeningQuizDoc[]> {
  const url = `/listening-quiz/admin/${id}`
  const response = await fetchServer<ListeningQuizDoc[]>(url)
  return response.data || []
}
