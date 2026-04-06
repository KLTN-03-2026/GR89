import { DashboardContent, getDashboardData } from '@/features/dashboard'

export default async function page() {
  const { user, lessonStats, entertainmentStats } = await getDashboardData()

  return (
    <DashboardContent
      user={user}
      lessonStats={lessonStats}
      entertainmentStats={entertainmentStats}
    />
  )
}
