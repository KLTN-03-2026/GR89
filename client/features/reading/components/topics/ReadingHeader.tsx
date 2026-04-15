'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { BookOpen, Brain, Target, Clock } from 'lucide-react'
import { ReadingOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface ReadingHeaderProps {
  overview: ReadingOverview
}

export function ReadingHeader({ overview }: ReadingHeaderProps) {
  const descriptions: IDescription[] = [
    { text: 'Luyện kỹ năng đọc hiểu tiếng Anh với các bài đọc đa dạng. Từ tin tức đến văn học, nâng cao khả năng đọc hiểu.' }
  ]

  const completionPercent = overview && overview.total > 0
    ? Math.round((overview.completed / overview.total) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '📖',
    title: 'Tiến độ đọc',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: 100,
    progressDescription: 'Dự kiến hoàn thành: 2 tháng nữa',
    color: 'from-indigo-500 to-indigo-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-indigo-600',
    Icon: BookOpen,
    title: 'Luyện Đọc',
    titleHighlight: 'Tiếng Anh',
    badge: ' Đa dạng',
    badge2: `📖 Hoàn thành ${completionPercent}%`,
    descriptions,
    background: 'from-indigo-500 via-blue-500 to-cyan-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Bài đọc', value: `${overview?.completed ?? 0}/${overview?.totalAvailable ?? 0}`, change: '', Icon: BookOpen, color: 'from-indigo-500 to-indigo-400' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`, change: '', Icon: Brain, color: 'from-blue-500 to-blue-400' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-cyan-500 to-cyan-400' },
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

