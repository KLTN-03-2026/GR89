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
