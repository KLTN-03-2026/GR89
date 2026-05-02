import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { DocumentQueryParams } from './api'
import { IDocumentCategory, IGlobalDocument } from '../type'

// Interface chung cho phản hồi từ API Server
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    next?: number | null
    prev?: number | null
  }
}

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE (Dùng cho Server Components)
 *============================================================================*/

// Lấy danh sách tài liệu từ Server (Dùng trong page.tsx)
export async function getGlobalDocumentsServer(params?: DocumentQueryParams): Promise<{
  data: IGlobalDocument[]
  pagination: ApiResponse<any>['pagination']
}> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.category) queryParams.append('category', params.category)

  const url = `/global-documents?${queryParams.toString()}`

  // fetchServer đã được cấu hình sẵn để lấy data từ response.data
  const response = await fetchServer<any>(url)

  console.log(response)
  // fetchServer của dự án trả về trực tiếp data bên trong, nhưng cấu trúc GlobalDocument
  // có chứa cả mảng documents và object pagination
  return {
    data: response.data || [],
    pagination: response.pagination
  }
}


// Lấy chi tiết một tài liệu từ Server
export async function getGlobalDocumentByIdServer(id: string): Promise<IGlobalDocument | null> {
  const response = await fetchServer<IGlobalDocument>(`/global-documents/${id}`)
  return response.data || null
}
