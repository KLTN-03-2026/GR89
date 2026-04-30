import { User } from '@/features/user/types'
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

/*=============== ENTERTAINMENT ==============*/
export interface Entertainment {
  _id: string
  title: string
  description?: string
  videoUrl?: { _id: string; url: string; format?: string; size?: number; duration?: number } | string
  thumbnailUrl?: { _id: string; url: string } | string
  type?: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  status?: boolean
  isVipRequired?: boolean
  author?: string
  parentId?: string | Entertainment
  orderIndex?: number
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface EntertainmentPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasPrev?: boolean
  hasNext?: boolean
  prev?: number | null
  next?: number | null
}

export async function getEntertainmentList(): Promise<Response<Entertainment[]>> {
  const res = await AuthorizedAxios.get('/entertainment/legacy')
  return res.data as Response<Entertainment[]>
}

export async function getEntertainmentPaginated(params?: {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: boolean
  createdBy?: string
  type?: 'movie' | 'music' | 'podcast'
}): Promise<{ success: boolean; data: Entertainment[]; pagination: EntertainmentPaginationMeta }> {
  const query = new URLSearchParams()
  if (params?.page != null) query.append('page', String(params.page))
  if (params?.limit != null) query.append('limit', String(params.limit))
  if (params?.search) query.append('search', params.search)
  if (params?.sortBy) query.append('sortBy', params.sortBy)
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params?.status !== undefined) query.append('status', params.status ? 'true' : 'false')
  if (params?.createdBy) query.append('createdBy', params.createdBy)
  if (params?.type) query.append('type', params.type)

  const url = `/entertainment/${query.toString() ? `?${query.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data
  const pagination: EntertainmentPaginationMeta = {
    page: payload.pagination?.page ?? params?.page ?? 1,
    limit: payload.pagination?.limit ?? params?.limit ?? 10,
    total: payload.pagination?.total || 0,
    pages: payload.pagination?.pages ?? 0,
    hasPrev: payload.pagination?.hasPrev ?? false,
    hasNext: payload.pagination?.hasNext ?? false,
    prev: payload.pagination?.prev ?? null,
    next: payload.pagination?.next ?? null
  }
  return { success: payload.success || false, data: payload.data || [], pagination }
}

export async function getEntertainmentById(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.get(`/entertainment/${id}`)
  return res.data as Response<Entertainment>
}

export async function createEntertainment(data: Partial<Entertainment>): Promise<Response<Entertainment>> {
  const payload: Partial<Entertainment> = { ...data }
  if (!payload.parentId || !String(payload.parentId).trim()) {
    delete payload.parentId
  }

  const res = await AuthorizedAxios.post('/entertainment/', payload)
  return res.data as Response<Entertainment>
}

export async function updateEntertainment(id: string, data: Partial<Entertainment>): Promise<Response<Entertainment>> {
  const payload: Partial<Entertainment> = { ...data }
  if (!payload.parentId || !String(payload.parentId).trim()) {
    delete payload.parentId
  }

  const res = await AuthorizedAxios.put(`/entertainment/${id}`, payload)
  return res.data as Response<Entertainment>
}

export async function deleteEntertainment(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.delete(`/entertainment/${id}`)
  return res.data as Response<Entertainment>
}

export async function deleteMEntertainmentEntertainment(ids: string[]): Promise<Response<Entertainment[]>> {
  const res = await AuthorizedAxios.delete(`/entertainment/`, { data: { ids } })
  return res.data as Response<Entertainment[]>
}

export async function toggleEntertainmentStatus(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.patch(`/entertainment/${id}/status`)
  return res.data as Response<Entertainment>
}

export async function toggleEntertainmentVipStatus(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.patch(`/entertainment/${id}/vip`)
  return res.data as Response<Entertainment>
}

export async function updateMultipleEntertainmentStatus(
  ids: string[],
  status: boolean
): Promise<Response<{ updatedCount: number; updatedEntertainments: Entertainment[] }>> {
  const res = await AuthorizedAxios.put('/entertainment/bulk/status', {
    ids,
    status
  })
  return res.data as Response<{ updatedCount: number; updatedEntertainments: Entertainment[] }>
}

export async function deleteMultipleEntertainment(ids: string[]): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.delete('/entertainment/bulk/delete', { data: { ids } })
  return res.data as Response<Entertainment>
}

/*=============== ENTERTAINMENT export/import ==============*/

export async function exportEntertainmentExcel(type?: string): Promise<Blob> {
  const query = type ? `?type=${type}` : ''
  const res = await AuthorizedAxios.get(`/entertainment/export${query}`, { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function importEntertainmentJson(items: Entertainment[], skipErrors: boolean = false, type?: string): Promise<Response<Entertainment>> {
  const response = await AuthorizedAxios.post('/entertainment/import-json', {
    items,
    skipErrors,
    type
  })
  return response.data as Response<Entertainment>
}

/*=============== ENTERTAINMENT STATISTICS ==============*/
export async function getEntertainmentStats(type?: string): Promise<Response<any>> {
  const query = type ? `?type=${type}` : ''
  const res = await AuthorizedAxios.get(`/entertainment/overview${query}`)
  return res.data as Response<any>
}

