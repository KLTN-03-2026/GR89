import { ClassCatelogyPage } from '@/features/catelogies'
import { getCenterClassStats, getClassesByCategory } from '@/features/catelogies/services/serverApi'

export default async function TeenagerCategoryPage() {
  const [classes, stats] = await Promise.all([
    getClassesByCategory('teenager'),
    getCenterClassStats()
  ])
  return (
    <ClassCatelogyPage type="teenager" classes={classes} stats={stats} />
  )
}
