import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { Media } from '@/features/Media/types';

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

export interface MediaPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext?: boolean
  hasPrev?: boolean
  next?: number | null
  prev?: number | null
}

export interface MediaQueryParams {
  page?: number
  limit?: number
  type?: 'image' | 'audio' | 'video'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getMediaList(
  params?: MediaQueryParams
): Promise<{ success: boolean; data: Media[]; pagination: MediaPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.type) queryParams.append('type', params.type)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const url = `/media/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await AuthorizedAxios.get(url)
  const res = response.data as ApiResponse<Media[]>

  return {
    success: res.success,
    data: res.data || [],
    pagination: {
      page: res.pagination?.page ?? params?.page ?? 1,
      limit: res.pagination?.limit ?? params?.limit ?? 12,
      total: res.pagination?.total ?? 0,
      pages: res.pagination?.pages ?? 0,
      hasNext: res.pagination?.hasNext ?? false,
      hasPrev: res.pagination?.hasPrev ?? false,
      next: res.pagination?.next ?? null,
      prev: res.pagination?.prev ?? null,
    },
  }
}

export async function uploadImageSingle(file: File): Promise<ApiResponse<Media>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await AuthorizedAxios.post('/media/upload/single', formData)
  return response.data as ApiResponse<Media>
}

export async function uploadEditorImage(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await AuthorizedAxios.post('/media/upload/editor', formData)
  return response.data as ApiResponse<{ url: string; publicId: string }>
}

export async function uploadVideoFromYoutube(youtubeUrl: string): Promise<ApiResponse<Media>> {
  const response = await AuthorizedAxios.post('/media/upload/video/youtube', { youtubeUrl })
  return response.data as ApiResponse<Media>
}

export async function uploadVideoFromVimeo(vimeoUrl: string): Promise<ApiResponse<Media>> {
  const response = await AuthorizedAxios.post('/media/upload/video/vimeo', { vimeoUrl })
  return response.data as ApiResponse<Media>
}

export async function uploadAudioSingle(file: File): Promise<ApiResponse<Media>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await AuthorizedAxios.post('/media/upload/audio', formData)
  return response.data as ApiResponse<Media>
}

export async function uploadAudioMultiple(files: File[]): Promise<ApiResponse<Media[]>> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const response = await AuthorizedAxios.post('/media/upload/multiple', formData)
  return response.data as ApiResponse<Media[]>
}

export async function uploadVideoSingle(file: File): Promise<ApiResponse<Media>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await AuthorizedAxios.post('/media/upload/video', formData)
  return response.data as ApiResponse<Media>
}

export async function deleteMedia(id: string): Promise<ApiResponse<null>> {
  const res = await AuthorizedAxios.delete(`/media/${id}`)
  return res.data as ApiResponse<null>
}

export async function updateMediaTitle(id: string, title: string): Promise<ApiResponse<Media>> {
  const response = await AuthorizedAxios.patch(`/media/${id}/title`, { title })
  return response.data as ApiResponse<Media>
}

export async function deleteMedias(ids: string[]): Promise<
  ApiResponse<{
    requested: number
    deleted: number
    skipped: number
    notAllowedOrMissing: string[]
    linked: string[]
  }>
> {
  const res = await AuthorizedAxios.delete('/media/', { data: { ids } })
  return res.data as ApiResponse<{
    requested: number
    deleted: number
    skipped: number
    notAllowedOrMissing: string[]
    linked: string[]
  }>
}
