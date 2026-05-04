import 'server-only'
import { fetchServer } from '@/libs/apis/fetch-server'
import type { CategoryType, CenterClassStats, IClass } from '../types'

export async function getClassesByCategory(category: CategoryType): Promise<IClass[]> {
  const query = new URLSearchParams({ category })
  const classes = await fetchServer<IClass[]>(`/center-classes/user?${query.toString()}`)
  return classes
}

export async function getClassById(id: string): Promise<IClass> {
  const centerClass = await fetchServer<IClass>(`/center-classes/user/${id}`)
  return centerClass
}

export async function getCenterClassStats(category?: CategoryType): Promise<CenterClassStats> {
  const query = new URLSearchParams()
  if (category) query.set('category', category)
  const stats = await fetchServer<CenterClassStats>(`/center-classes/user/stats?${query.toString()}`)
  return stats
}
