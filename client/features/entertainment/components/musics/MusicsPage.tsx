'use client'
import { useMemo } from "react"
import { WelcomeSection } from "@/components/common/WelcomeSection"
import { Musics } from "./Musics"
import { IStreakCardProps, IWelcomeContentProps, IDescription, IStatsOverview } from "@/types"
import { Clock, Music, Target } from "lucide-react"
import type { EntertainmentStatsEntry, EntertainmentItem } from '@/features/entertainment'
import { formatStudyTime } from "@/libs/utils/formatStudyTime"

interface MusicsPageProps {
  musicStats: EntertainmentStatsEntry | null
  items: EntertainmentItem[]
}

export function MusicsPage({ musicStats, items }: MusicsPageProps) {
  const totalTracks = musicStats?.totalItems ?? 0
  const listenedTracks = musicStats?.viewedCount ?? 0
  const completion = totalTracks > 0 ? Math.round((listenedTracks / totalTracks) * 100) : 0
  const timeLabel = formatStudyTime(musicStats?.totalWatchTime)

  const descriptions: IDescription[] = [
    {
      text: 'Học tiếng Anh qua âm nhạc với lyrics thông minh. Từ pop đến rock, nâng cao kỹ năng nghe và phát âm.',
    }
  ]

  const streakCard: IStreakCardProps = {
    icon: "🎵",
    title: "Bài hát đã nghe",
    value: listenedTracks,
    valueText: `${listenedTracks} bài`,
    progress: totalTracks > 0 ? Math.min(100, completion) : 0,
    progressDescription: totalTracks > 0 ? `Mục tiêu: ${totalTracks} bài` : 'Thêm bài hát để bắt đầu',
    color: "from-purple-500 to-purple-400"
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: "text-purple-600",
    Icon: Music,
    title: "Học Tiếng Anh",
    titleHighlight: "Qua Âm Nhạc",
    badge: " Giải trí",
    badge2: totalTracks > 0 ? `🎵 ${listenedTracks}/${totalTracks} bài` : "Chưa có dữ liệu",
    descriptions,
    background: "from-purple-500 via-violet-500 to-indigo-200"
  }

  const statsOverview: IStatsOverview[] = useMemo<IStatsOverview[]>(() => {
    const remaining = Math.max(totalTracks - listenedTracks, 0)
    return [
      {
        title: "Bài hát đã nghe",
        value: String(listenedTracks),
        change: totalTracks ? `Tổng ${totalTracks} bài` : "Chưa có dữ liệu",
        Icon: Music,
        color: 'from-purple-500 to-purple-400',
      },
      {
        title: "Thời gian nghe",
        value: timeLabel,
        change: listenedTracks ? `~${Math.max(1, Math.round(((musicStats?.totalWatchTime || 0) / Math.max(listenedTracks, 1)) / 60))} phút/bài` : '',
        Icon: Clock,
        color: 'from-violet-500 to-violet-400',
      },
      {
        title: "Tỷ lệ hoàn thành",
        value: `${completion}%`,
        change: totalTracks ? `Còn ${remaining} bài chưa nghe` : '',
        Icon: Target,
        color: 'from-blue-500 to-indigo-400',
      },
      {
        title: "Bài hát chưa nghe",
        value: String(remaining),
        change: totalTracks ? 'Chọn một bài và bắt đầu ngay' : '',
        Icon: Music,
        color: 'from-indigo-500 to-blue-500',
      },
    ]
  }, [completion, listenedTracks, totalTracks, timeLabel, musicStats])

  return (
    <>
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={statsOverview}
        streakCard={streakCard}
      />

      <Musics items={items} />
    </>
  )
}

