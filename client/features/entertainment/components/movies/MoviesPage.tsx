'use client'
import { useMemo } from "react"
import { WelcomeSection } from "@/components/common/WelcomeSection"
import { Movies } from "./Movies"
import { IStreakCardProps, IWelcomeContentProps, IButton, IDescription, IStatsOverview } from "@/types"
import { Clock, Play, Film, Target } from "lucide-react"
import type { EntertainmentStatsEntry, EntertainmentItem } from '@/features/entertainment'
import { formatStudyTime } from "@/libs/utils/formatStudyTime"

interface MoviesPageProps {
  movieStats: EntertainmentStatsEntry | null
  items: EntertainmentItem[]
}

export function MoviesPage({ movieStats, items }: MoviesPageProps) {
  const totalMovies = movieStats?.totalItems ?? 0
  const watchedMovies = movieStats?.viewedCount ?? 0
  const completion = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0
  const watchTime = formatStudyTime(movieStats?.totalWatchTime)

  const buttons: IButton[] = [
    { type: 'default', text: 'Xem phim mới', icon: Play },
    { type: 'outline', text: 'Xem lại phim yêu thích', icon: Film }
  ]

  const descriptions: IDescription[] = [
    {
      text: 'Học tiếng Anh qua phim với phụ đề thông minh. Từ phim hài đến phim kinh dị, nâng cao kỹ năng nghe và hiểu văn hóa.',
    }
  ]

  const streakCard: IStreakCardProps = {
    icon: "🎬",
    title: "Phim đã xem",
    value: watchedMovies,
    valueText: `${watchedMovies} bộ`,
    progress: totalMovies > 0 ? Math.min(100, completion) : 0,
    progressDescription: totalMovies > 0 ? `Tổng ${totalMovies} phim` : 'Chưa có dữ liệu',
    color: "from-red-500 to-red-400"
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: "text-red-600",
    Icon: Film,
    title: "Học Tiếng Anh",
    titleHighlight: "Qua Phim",
    badge: " Giải trí",
    badge2: totalMovies > 0 ? `🎬 ${watchedMovies}/${totalMovies} phim` : "Chưa có dữ liệu",
    descriptions,
    buttons,
    background: "from-red-500 via-rose-500 to-pink-200"
  }

  const statsOverview: IStatsOverview[] = useMemo<IStatsOverview[]>(() => {
    const remaining = Math.max(totalMovies - watchedMovies, 0)
    return [
      {
        title: "Phim đã xem",
        value: String(watchedMovies),
        change: totalMovies ? `Tổng ${totalMovies} phim` : 'Chưa có dữ liệu',
        Icon: Film,
        color: "from-red-500 to-red-400",
      },
      {
        title: "Thời gian xem",
        value: watchTime,
        change: watchedMovies ? `~${Math.max(1, Math.round(((movieStats?.totalWatchTime || 0) / Math.max(watchedMovies, 1)) / 60))} phút/phim` : '',
        Icon: Clock,
        color: "from-rose-500 to-rose-400",
      },
      {
        title: "Tỷ lệ hoàn thành",
        value: `${completion}%`,
        change: remaining > 0 ? `${remaining} phim còn lại` : 'Đã xem hết tất cả',
        Icon: Target,
        color: "from-pink-500 to-pink-400",
      },
      {
        title: "Phim chưa xem",
        value: String(remaining),
        change: remaining > 0 ? 'Tiếp tục hành trình của bạn' : 'Hãy thêm phim mới!',
        Icon: Film,
        color: "from-fuchsia-500 to-fuchsia-400",
      },
    ]
  }, [completion, movieStats, totalMovies, watchedMovies, watchTime])

  return (
    <>
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={statsOverview}
        streakCard={streakCard}
      />

      <Movies items={items} />
    </>
  )
}

