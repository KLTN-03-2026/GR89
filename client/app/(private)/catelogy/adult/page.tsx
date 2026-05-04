import { ClassCatelogyPage } from '@/features/catelogies'
import { getCenterClassStats, getClassesByCategory } from '@/features/catelogies/services/serverApi'

export default async function AdultCategoryPage() {
  const [classes, stats] = await Promise.all([
    getClassesByCategory('adult'),
    getCenterClassStats()
  ])
  return (
    <ClassCatelogyPage type="adult" classes={classes} stats={stats} />
  )
}
