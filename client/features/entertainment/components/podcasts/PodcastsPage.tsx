'use client'
import { useMemo } from "react"
import { WelcomeSection } from "@/components/common/WelcomeSection"
import { Podcasts } from "./Podcasts"
import { IStreakCardProps, IWelcomeContentProps, IDescription, IStatsOverview } from "@/types"
import { Clock, Mic, Radio, Target } from "lucide-react"
import type { EntertainmentStatsEntry, EntertainmentItem } from '@/features/entertainment'
import { formatStudyTime } from "@/libs/utils/formatStudyTime"

interface PodcastsPageProps {
  podcastStats: EntertainmentStatsEntry | null
  items: EntertainmentItem[]
}

export function PodcastsPage({ podcastStats, items }: PodcastsPageProps) {
  const totalEpisodes = podcastStats?.totalItems ?? 0
  const listenedEpisodes = podcastStats?.viewedCount ?? 0
  const completion = totalEpisodes > 0 ? Math.round((listenedEpisodes / totalEpisodes) * 100) : 0
  const listenTime = formatStudyTime(podcastStats?.totalWatchTime)

  const descriptions: IDescription[] = [
    {
      text: 'Học tiếng Anh qua podcast chọn lọc. Luyện nghe – mở rộng từ vựng – hiểu văn hoá.',
    }
  ]

  const streakCard: IStreakCardProps = {
    icon: "🎙️",
    title: "Tập đã nghe",
    value: listenedEpisodes,
    valueText: `${listenedEpisodes} tập`,
    progress: totalEpisodes > 0 ? Math.min(100, completion) : 0,
    progressDescription: totalEpisodes > 0 ? `Tổng ${totalEpisodes} tập` : 'Chưa có dữ liệu',
    color: "from-emerald-500 to-emerald-400"
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: "text-emerald-600",
    Icon: Mic,
    title: "Học Tiếng Anh",
    titleHighlight: "Qua Podcast",
    badge: " Khám phá",
    badge2: totalEpisodes > 0 ? `🎧 ${listenedEpisodes}/${totalEpisodes} tập` : "Chưa có dữ liệu",
    descriptions,
    background: "from-emerald-500 via-green-500 to-teal-200"
  }

  const statsOverview: IStatsOverview[] = useMemo<IStatsOverview[]>(() => {
    const remaining = Math.max(totalEpisodes - listenedEpisodes, 0)
    return [
      {
        title: "Tập đã nghe",
        value: String(listenedEpisodes),
        change: totalEpisodes ? `Tổng ${totalEpisodes} tập` : 'Chưa có dữ liệu',
        Icon: Mic,
        color: "from-emerald-500 to-emerald-400",
      },
      {
        title: "Thời gian nghe",
        value: listenTime,
        change: listenedEpisodes ? `~${Math.max(1, Math.round(((podcastStats?.totalWatchTime || 0) / Math.max(listenedEpisodes, 1)) / 60))} phút/tập` : '',
        Icon: Clock,
        color: "from-green-500 to-green-400",
      },
      {
        title: "Tỷ lệ hoàn thành",
        value: `${completion}%`,
        change: remaining > 0 ? `${remaining} tập còn lại` : 'Đã nghe hết tất cả',
        Icon: Target,
        color: "from-teal-500 to-teal-400",
      },
      {
        title: "Tập chưa nghe",
        value: String(remaining),
        change: remaining > 0 ? 'Tiếp tục khám phá' : 'Thêm podcast mới!',
        Icon: Radio,
        color: "from-cyan-500 to-cyan-400",
      },
    ]
  }, [completion, listenTime, listenedEpisodes, podcastStats, totalEpisodes])

  return (
    <>
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={statsOverview}
        streakCard={streakCard}
      />

      <Podcasts items={items} />
    </>
  )
}

