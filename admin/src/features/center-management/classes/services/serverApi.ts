import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { ClassQueryParams } from './api'
import { ICenterClass, IHomework } from '../type'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE (Dùng cho Server Components)
 *============================================================================*/

// Lấy danh sách lớp học từ Server (Dùng trong page.tsx)
export async function getCenterClassesServer(params?: ClassQueryParams): Promise<{
  data: ICenterClass[]
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
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.category) queryParams.append('category', params.category)
  if (params?.status) queryParams.append('status', params.status)

  const url = `/center-classes?${queryParams.toString()}`
  const response = await fetchServer<ICenterClass[]>(url)

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

// Lấy chi tiết lớp học từ Server
export async function getCenterClassByIdServer(id: string): Promise<ICenterClass | null> {
  const response = await fetchServer<ICenterClass>(`/center-classes/${id}`)
  return response.data || null
}

// Lấy chi tiết bài tập từ Server (bao gồm danh sách bài nộp)
export async function getHomeworkByIdServer(id: string): Promise<IHomework | null> {
  const response = await fetchServer<IHomework>(`/center-classes/homework/${id}`)
  return response.data || null
}
