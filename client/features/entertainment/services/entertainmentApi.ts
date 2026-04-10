'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'

export type EntertainmentType = 'movie' | 'music' | 'podcast'

export interface EntertainmentItem {
  _id: string
  title: string
  description?: string
  author?: string
  thumbnailUrl?: { url: string } | string
  userFlags?: { liked?: boolean; watched?: boolean }
  isVipRequired?: boolean
}

export interface EntertainmentComment {
  _id: string
  content: string
  createdAt: string
  user: {
    _id: string
    fullName: string
  }
}

export interface EntertainmentStatsEntry {
  type: EntertainmentType
  totalItems: number
  viewedCount: number
  totalWatchTime: number
}

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function getEntertainmentStatsForUser(): Promise<ApiResponse<EntertainmentStatsEntry[]>> {
  const response = await authorizedAxios.get<ApiResponse<EntertainmentStatsEntry[]>>('/entertainment/user/stats')
  return response.data
}

export async function getEntertainmentList(type: EntertainmentType): Promise<ApiResponse<EntertainmentItem[]>> {
  const response = await authorizedAxios.get<ApiResponse<EntertainmentItem[]>>(`/entertainment/user/list?type=${type}`)
  return response.data
}

export async function toggleEntertainmentLike(entertainmentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  const response = await authorizedAxios.patch<ApiResponse<{ liked: boolean; likesCount: number }>>(`/entertainment/user/${entertainmentId}/like`)
  return response.data
}

export async function getEntertainmentComments(entertainmentId: string): Promise<ApiResponse<EntertainmentComment[]>> {
  const response = await authorizedAxios.get<ApiResponse<EntertainmentComment[]>>(`/entertainment/user/${entertainmentId}/comments`)
  return response.data
}

export async function createEntertainmentComment(entertainmentId: string, content: string): Promise<ApiResponse<EntertainmentComment>> {
  const response = await authorizedAxios.post<ApiResponse<EntertainmentComment>>(`/entertainment/user/${entertainmentId}/comments`, { content })
  return response.data
}
