import { CategoryContainer } from '@/features/catelogies'
import { getCenterClassStats, getClassesByCategory } from '@/features/catelogies/services/serverApi'

export default async function TeenagerCategoryPage() {
  const [classes, stats] = await Promise.all([
    getClassesByCategory('teenager'),
    getCenterClassStats()
  ])
  return (
    <CategoryContainer type="teenager" classes={classes} stats={stats} />
  )
}
