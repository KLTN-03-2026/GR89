import { DashboardContent, getDashboardData } from '@/features/dashboard'

export default async function DashboardPage() {
  const { user, lessonStats, entertainmentStats, recentActivities } = await getDashboardData()
  
  return (
    <DashboardContent
      user={user}
      lessonStats={lessonStats}
      entertainmentStats={entertainmentStats}
      recentActivities={recentActivities}
    />
  )
}
