'use client'
import { WelcomeSection } from "@/components/common/WelcomeSection"
import { IStatsOverview, IWelcomeContentProps, IStreakCardProps } from "@/types"
import { Clock, Flame, Star } from "lucide-react"
import { LessonStatsResponse } from "@/libs/apis/api"
import SkillsProgress from "./SkillsProgress"
import StudyTimeStats from "./StudyTimeStats"
import EntertainmentStats from "./EntertainmentStats"
import { formatStudyTime } from "@/libs/utils/formatStudyTime"
import type { EntertainmentStatsEntry } from '@/features/entertainment'
import { User } from "@/types/user"
import { QuickActions } from "./QuickActions"
import { RecentActivities } from "./RecentActivities"

interface DashboardContentProps {
  user: User
  lessonStats: LessonStatsResponse | null
  entertainmentStats: EntertainmentStatsEntry[]
}

export function DashboardContent({ user, lessonStats, entertainmentStats }: DashboardContentProps) {
  const streak = user?.currentStreak || 0
  const longestStreak = user?.longestStreak || 0

  const descriptions: { text: string, textHighlight?: string | '' }[] = [
    {
      text: (streak ?? 0) === 0
        ? 'Chào mừng! Hôm nay hãy bắt đầu với'
        : 'Bạn đang có tiến độ tuyệt vời! Hôm nay hãy tiếp tục với',
      textHighlight: 'bài học Từ vựng'
    },
    {
      text: (streak ?? 0) === 0 ? 'để khởi động chuỗi học.' : 'và duy trì chuỗi',
      textHighlight: (streak ?? 0) === 0 ? '' : `${streak ?? 0} ngày`
    },
    {
      text: (streak ?? 0) === 0 ? '' : 'học liên tục.'
    }
  ]

  const isZero = (streak ?? 0) === 0
  const streakCard: IStreakCardProps = isZero
    ? {
      icon: "🌱",
      title: "Bắt đầu chuỗi ngày",
      value: 0,
      valueText: '0',
      progress: 30,
      progressDescription: "Học một bài hôm nay để khởi động chuỗi!",
      color: "from-slate-400/80 to-slate-600/80"
    }
    : {
      icon: "🔥",
      title: "Chuỗi ngày hiện tại",
      value: Number(streak ?? 0),
      valueText: String(streak ?? 0),
      progress: 30,
      progressDescription: "Tiếp tục cố gắng nhé!",
      color: "from-yellow-500/80 to-orange-500/80"
    }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: "text-yellow-300",
    Icon: "/images/logo.png",
    title: isZero ? "Chào mừng!" : "Chào mừng trở lại!",
    titleHighlight: isZero ? "Bắt đầu hành trình" : "Tiếp tục hành trình",
    badge: "🎯 Học tập thông minh",
    badge2: isZero
      ? (longestStreak && longestStreak > 0 ? `🏆 Kỷ lục: ${longestStreak} ngày` : "🌱 Chưa có chuỗi")
      : (longestStreak && longestStreak > streak
        ? `🔥 Chuỗi ${streak} ngày | 🏆 Kỷ lục ${longestStreak ?? 0} ngày`
        : `🔥 Chuỗi ${streak ?? 0} ngày`),
    descriptions: descriptions,
    background: "from-blue-800 to-blue-500"
  }

  // Tính toán số liệu từ lessonStats
  const totalPointsComputed = lessonStats
    ? (Number(lessonStats.vocabulary?.totalScore || 0) +
      Number(lessonStats.grammar?.totalScore || 0) +
      Number(lessonStats.reading?.totalScore || 0) +
      Number(lessonStats.listening?.totalScore || 0) +
      Number(lessonStats.writing?.totalScore || 0) +
      Number(lessonStats.speaking?.totalScore || 0) +
      Number((lessonStats as { ipa?: { totalScore?: number } }).ipa?.totalScore || 0))
    : 0

  const totalTimeSeconds = lessonStats
    ? (Object.values(lessonStats) as unknown as { totalTime?: number }[]).reduce((sum, skill) => sum + Number(skill?.totalTime || 0), 0)
    : 0

  const formattedStudyTime = formatStudyTime(totalTimeSeconds)

  // Chỉ hiển thị 3 thẻ: Tổng điểm, Chuỗi ngày, Thời gian học
  const statsOverview: IStatsOverview[] = [
    {
      title: "Tổng điểm",
      value: Number(totalPointsComputed).toFixed(2),
      change: "",
      Icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Chuỗi ngày",
      value: String(streak ?? 0),
      change: (longestStreak ?? 0) > 0 ? `🏆 Kỷ lục: ${longestStreak} ngày` : "Chưa có kỷ lục",
      Icon: Flame,
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Thời gian học",
      value: formattedStudyTime,
      change: "",
      Icon: Clock,
      color: "from-blue-500 to-indigo-500",
    }
  ]

  return (
    <>
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={statsOverview}
        streakCard={streakCard}
      />

      {/* Tiến độ kỹ năng */}
      <div className="mt-4">
        <SkillsProgress lessonStats={lessonStats} />
      </div>

      {/* Thời gian học theo kỹ năng */}
      <div className="mt-4">
        <StudyTimeStats lessonStats={lessonStats} />
      </div>

      {/* Giải trí */}
      <div className="mt-4">
        <EntertainmentStats stats={entertainmentStats} />
      </div>

      {/* Hành động nhanh & Hoạt động gần đây */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full mt-4">
        <QuickActions />
        <RecentActivities />
      </div>
    </>
  )
}

