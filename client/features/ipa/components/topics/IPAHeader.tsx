'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { Volume2, Target, BookOpen, Clock } from 'lucide-react'
import { IpaOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface IPAHeaderProps {
  overview: IpaOverview
}

export function IPAHeader({ overview }: IPAHeaderProps) {
  const descriptions: IDescription[] = [
    { text: 'Học phiên âm quốc tế IPA một cách có hệ thống. Nắm vững cách phát âm chuẩn và cải thiện kỹ năng speaking.' }
  ]

  const completionPercent = overview && overview.total > 0
    ? Math.round((overview.completed / overview.total) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '🎤',
    title: 'Tiến độ IPA',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: 100,
    progressDescription: 'Dự kiến hoàn thành: 1 tháng nữa',
    color: 'from-purple-400 to-purple-300'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-slate-200',
    Icon: Volume2,
    title: 'Học Phiên Âm',
    titleHighlight: 'IPA',
    badge: ' Hệ thống',
    badge2: `🎤 Hoàn thành ${completionPercent}%`,
    descriptions,
    background: 'from-purple-400 via-violet-400 to-indigo-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Bài học IPA', value: `${overview?.completed ?? 0}/${overview?.totalAvailable ?? 0}`, change: '', Icon: BookOpen, color: 'from-indigo-600 to-indigo-700' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`, change: '', Icon: Volume2, color: 'from-purple-600 to-purple-700' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-emerald-600 to-emerald-700' },
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
