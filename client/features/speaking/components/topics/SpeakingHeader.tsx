'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { Mic, MessageCircle, Brain, Target, Clock } from 'lucide-react'
import { SpeakingOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface SpeakingHeaderProps {
  overview: SpeakingOverview
}

export function SpeakingHeader({ overview }: SpeakingHeaderProps) {
  const descriptions: IDescription[] = [
    { text: 'Luyện kỹ năng nói tiếng Anh với các chủ đề đa dạng. Từ hội thoại đến thuyết trình, nâng cao khả năng giao tiếp.' }
  ]

  const completionPercent = overview && overview.totalAvailable > 0
    ? Math.round((overview.completed / overview.totalAvailable) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '🎤',
    title: 'Tiến độ nói',
    valueText: `${completionPercent}%`,
    progress: completionPercent,
    progressDescription: 'Dự kiến hoàn thành: 1.5 tháng nữa',
    color: 'from-orange-500 to-orange-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-orange-600',
    Icon: Mic,
    title: 'Luyện Nói',
    titleHighlight: 'Tiếng Anh',
    badge: ' Thực hành',
    badge2: `🎤 Hoàn thành ${completionPercent}%`,
    descriptions,
    background: 'from-orange-500 via-amber-500 to-yellow-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Bài nói', value: `${overview?.total ?? 0}/${overview?.totalAvailable ?? 0}`, change: '', Icon: MessageCircle, color: 'from-orange-500 to-orange-400' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`, change: '', Icon: Brain, color: 'from-amber-500 to-amber-400' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-yellow-500 to-yellow-400' },
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

