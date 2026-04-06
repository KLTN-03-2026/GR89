import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { IPATopic } from '../types'

export async function getRoadmapData() {
  const roadmapData = await fetchServer<IPATopic[]>('/roadmap/user') || []
  return { roadmapData }
}
