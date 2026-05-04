import { CategoryContainer } from '@/features/catelogies'
import { getCenterClassStats, getClassesByCategory } from '@/features/catelogies/services/serverApi'

export default async function KidsCategoryPage() {
  const [classes, stats] = await Promise.all([
    getClassesByCategory('kids'),
    getCenterClassStats()
  ])
  return (
    <CategoryContainer type="kids" classes={classes} stats={stats} />
  )
}
