import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { IGlobalDocument } from '../../types'

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

export interface DocumentQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
}

export async function getGlobalDocuments(params?: DocumentQueryParams): Promise<ApiResponse<IGlobalDocument[]>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.category) queryParams.append('category', params.category)

  const url = `/global-documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await AuthorizedAxios.get(url)
  return response.data as ApiResponse<IGlobalDocument[]>
}

export async function getGlobalDocumentById(id: string): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.get(`/global-documents/${id}`)
  return response.data as ApiResponse<IGlobalDocument>
}

export async function createGlobalDocument(data: Partial<IGlobalDocument>): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.post('/global-documents', data)
  return response.data as ApiResponse<IGlobalDocument>
}

export async function updateGlobalDocument(id: string, data: Partial<IGlobalDocument>): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.put(`/global-documents/${id}`, data)
  return response.data as ApiResponse<IGlobalDocument>
}

export async function deleteGlobalDocument(id: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete(`/global-documents/${id}`)
  return response.data as ApiResponse<void>
}

export async function deleteManyGlobalDocuments(ids: string[]): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.post('/global-documents/delete-many', { ids })
  return response.data as ApiResponse<void>
}

export async function getGlobalDocumentCategories(): Promise<ApiResponse<string[]>> {
  const response = await AuthorizedAxios.get('/global-documents/categories')
  return response.data as ApiResponse<string[]>
}
