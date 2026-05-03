import { ArrowRight } from "lucide-react";
import RecentActivitiCard from "./RecentActivitiCard";
import { IRecentActivity, ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { RecentActivity, RecentActivityCategory } from "../types";
import { BookOpen, Eye, FileText, Headphones, Mic, PenTool, Volume2 } from "lucide-react";
import Link from "next/link";

interface RecentActivitiesProps {
  activities: RecentActivity[]
}

const categoryMeta: Record<RecentActivityCategory, { title: string; Icon: IRecentActivity['Icon']; color: string }> = {
  vocabulary: { title: 'Hoàn thành bài học Từ vựng', Icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
  grammar: { title: 'Hoàn thành bài học Ngữ pháp', Icon: FileText, color: 'from-pink-500 to-rose-500' },
  reading: { title: 'Hoàn thành bài học Luyện đọc', Icon: Eye, color: 'from-indigo-500 to-blue-600' },
  listening: { title: 'Hoàn thành bài học Luyện nghe', Icon: Headphones, color: 'from-cyan-500 to-blue-500' },
  speaking: { title: 'Hoàn thành bài học Luyện nói', Icon: Mic, color: 'from-green-500 to-emerald-500' },
  writing: { title: 'Hoàn thành bài học Luyện viết', Icon: PenTool, color: 'from-amber-500 to-orange-500' },
  ipa: { title: 'Hoàn thành bài học IPA', Icon: Volume2, color: 'from-violet-500 to-purple-500' },
}

const toRelativeTime = (date: string) => {
  const now = new Date().getTime()
  const createdAt = new Date(date).getTime()
  const diffMs = Math.max(0, now - createdAt)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))} phút trước`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ trước`
  return `${Math.floor(diffMs / day)} ngày trước`
}

export const mapRecentActivitiesForUI = (activities: RecentActivity[]): IRecentActivity[] => {
  if (!activities.length) return ROUTES.RECENT_ACTIVITIES

  return activities.map((activity) => {
    const meta = categoryMeta[activity.category]
    return {
      title: meta.title,
      subtitle: activity.lessonTitle,
      time: toRelativeTime(activity.createdAt),
      Icon: meta.Icon,
      color: meta.color
    }
  })
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const displayActivities: IRecentActivity[] = mapRecentActivitiesForUI(activities)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-1">
          ⚡ Hoạt động gần đây
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Những bài học bạn đã hoàn thành</p>
      </div>

      <div className="space-y-3">
        {displayActivities.map((activity: IRecentActivity, index: number) => (
          <RecentActivitiCard key={index} {...activity} />
        ))}
      </div>

      <div className="mt-4 text-center">
        <Button asChild variant="link" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium p-0 h-auto text-sm">
          <Link href="/dashboard/activities">
          Xem tất cả
          <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
