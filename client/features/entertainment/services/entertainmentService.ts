import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { EntertainmentStatsEntry, EntertainmentItem } from './entertainmentApi'

export type EntertainmentType = 'movie' | 'music' | 'podcast'

/** Response from /entertainment/user/:id */
export interface EntertainmentDetailResponse {
  _id: string
  title: string
  description?: string
  author?: string
  type?: EntertainmentType
  videoUrl?: { url: string; poster?: string }
  thumbnailUrl?: { url: string }
  videoSubtitleList?: { start: number; end: number; en: string; vi: string }[]
}

export async function getEntertainmentStats() {
  return fetchServer<EntertainmentStatsEntry[]>('/entertainment/user/stats')
}

export async function getEntertainmentList(type: EntertainmentType) {
  return fetchServer<EntertainmentItem[]>(`/entertainment/user/list?type=${type}`)
}

export async function getEntertainmentData(type: EntertainmentType) {
  const [statsResponse, itemsResponse] = await Promise.all([
    getEntertainmentStats(),
    getEntertainmentList(type)
  ])

  const stats = (statsResponse || []).find((entry) => entry.type === type) || null
  const items = itemsResponse || []

  return { stats, items }
}

export async function getEntertainmentDetail(id: string) {
  return fetchServer<EntertainmentDetailResponse>(`/entertainment/user/${id}`)
}

