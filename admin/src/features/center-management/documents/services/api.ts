import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { IDocumentCategory, IGlobalDocument } from '../type'

// Interface chung cho phản hồi từ API
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

// Interface cho tham số truy vấn tài liệu
export interface DocumentQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
}

export interface CreateGlobalDocumentRequest {
  name: string
  category: string
  content: string
}

/*=============================================================================
 * DANH SÁCH API CHO TÀI LIỆU (GLOBAL DOCUMENTS)
 *============================================================================*/

// Lấy danh sách tài liệu (Client Side)
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

// Lấy chi tiết một tài liệu theo ID
export async function getGlobalDocumentById(id: string): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.get(`/global-documents/${id}`)
  return response.data as ApiResponse<IGlobalDocument>
}

// Tạo tài liệu mới
export async function createGlobalDocument(data: CreateGlobalDocumentRequest): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.post('/global-documents', data)
  return response.data as ApiResponse<IGlobalDocument>
}

// Cập nhật thông tin tài liệu
export async function updateGlobalDocument(id: string, data: Partial<CreateGlobalDocumentRequest>): Promise<ApiResponse<IGlobalDocument>> {
  const response = await AuthorizedAxios.put(`/global-documents/${id}`, data)
  return response.data as ApiResponse<IGlobalDocument>
}

// Xóa một tài liệu
export async function deleteGlobalDocument(id: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete(`/global-documents/${id}`)
  return response.data as ApiResponse<void>
}

// Xóa nhiều tài liệu cùng lúc
export async function deleteManyGlobalDocuments(ids: string[]): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.post('/global-documents/delete-many', { ids })
  return response.data as ApiResponse<void>
}

// Tải tài liệu về .docx từ Server
export async function downloadGlobalDocumentDocx(id: string, fileName: string): Promise<void> {
  const response = await AuthorizedAxios.get(`/global-documents/${id}/download`, {
    responseType: 'blob'
  })

  // Tạo URL từ blob nhận được (response.data đã là một Blob nhờ responseType: 'blob')
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${fileName}.docx`)

  // Kích hoạt tải về
  document.body.appendChild(link)
  link.click()

  // Dọn dẹp
  link.parentNode?.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/*=============================================================================
 * DANH SÁCH API CHO DANH MỤC (DOCUMENT CATEGORIES)
 *============================================================================*/

// Lấy tất cả danh mục tài liệu
export async function getGlobalDocumentCategories(): Promise<ApiResponse<IDocumentCategory[]>> {
  const response = await AuthorizedAxios.get('/global-documents/categories')
  return response.data as ApiResponse<IDocumentCategory[]>
}

// Tạo danh mục mới
export async function createDocumentCategory(data: { name: string }): Promise<ApiResponse<IDocumentCategory>> {
  const response = await AuthorizedAxios.post('/global-documents/categories', data)
  return response.data as ApiResponse<IDocumentCategory>
}

// Lấy chi tiết một danh mục
export async function getDocumentCategoryById(id: string): Promise<ApiResponse<IDocumentCategory>> {
  const response = await AuthorizedAxios.get(`/global-documents/categories/${id}`)
  return response.data as ApiResponse<IDocumentCategory>
}

// Cập nhật tên danh mục
export async function updateDocumentCategory(id: string, data: { name: string }): Promise<ApiResponse<IDocumentCategory>> {
  const response = await AuthorizedAxios.put(`/global-documents/categories/${id}`, data)
  return response.data as ApiResponse<IDocumentCategory>
}

// Xóa danh mục (Chỉ xóa được khi không có tài liệu bên trong)
export async function deleteDocumentCategory(id: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete(`/global-documents/categories/${id}`)
  return response.data as ApiResponse<void>
}
