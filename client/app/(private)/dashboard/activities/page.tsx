import { fetchServer } from '@/libs/apis/fetch-server'
import type { RecentActivity } from '@/features/dashboard/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import RecentActivitiCard from '@/features/dashboard/components/RecentActivitiCard'
import { mapRecentActivitiesForUI } from '@/features/dashboard/components/RecentActivities'

export default async function ActivitiesPage() {
  const activities = await fetchServer<RecentActivity[]>('/user/me/recent-activities?limit=50')
  const displayActivities = mapRecentActivitiesForUI(activities || [])
  const hasActivities = activities.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Tất cả hoạt động gần đây</CardTitle>
                <CardDescription>
                  {hasActivities
                    ? `Bạn đã hoàn thành ${activities.length} hoạt động gần nhất`
                    : 'Lịch sử các bài học bạn đã hoàn thành sẽ hiển thị ở đây'}
                </CardDescription>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasActivities ? (
            displayActivities.map((activity, index) => (
              <RecentActivitiCard key={`${activity.title}-${index}`} {...activity} />
            ))
          ) : (
            <div className="py-10 text-center text-gray-500">
              Chưa có hoạt động nào gần đây.
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
