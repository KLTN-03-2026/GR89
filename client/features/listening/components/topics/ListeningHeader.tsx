'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IButton, IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { Headphones, Play, BookOpen, Brain, Target, Clock } from 'lucide-react'
import { ListeningOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface ListeningHeaderProps {
  overview: ListeningOverview
}

export function ListeningHeader({ overview }: ListeningHeaderProps) {
  const buttons: IButton[] = [
    { type: 'default', text: 'Bắt đầu nghe', icon: Play },
    { type: 'outline', text: 'Xem bài nghe', icon: BookOpen }
  ]

  const descriptions: IDescription[] = [
    { text: 'Luyện kỹ năng nghe hiểu tiếng Anh với các bài nghe đa dạng. Từ hội thoại đến bài giảng.' }
  ]

  const completionPercent = overview && overview.total > 0
    ? Math.round((overview.completed / overview.total) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '🎧',
    title: 'Tiến độ nghe',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: 100,
    progressDescription: 'Dự kiến hoàn thành: 1.5 tháng nữa',
    color: 'from-pink-500 to-pink-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-pink-600',
    Icon: Headphones,
    title: 'Luyện Nghe',
    titleHighlight: 'Tiếng Anh',
    badge: ' Đa dạng',
    badge2: `🎧 Hoàn thành ${completionPercent}%`,
    descriptions,
    buttons,
    background: 'from-pink-500 via-rose-500 to-red-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Bài nghe', value: `${overview?.completed ?? 0}/${overview?.totalAvailable ?? 0}`, change: '', Icon: BookOpen, color: 'from-pink-500 to-pink-400' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`, change: '', Icon: Brain, color: 'from-rose-500 to-rose-400' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-red-500 to-red-400' },
    { title: 'Thời gian học', value: formatStudyTime(overview?.totalTime || 0), change: '', Icon: Clock, color: 'from-slate-500 to-slate-400' },
  ]

  return (
    <WelcomeSection
      welcomeContent={welcomeContent}
      statsOverview={statsOverview}
      streakCard={streakCard}
    />
  )
}

