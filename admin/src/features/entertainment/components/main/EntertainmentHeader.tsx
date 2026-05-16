'use client'
import { useEffect, useState } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { SheetAddEntertainment } from '../dialog/SheetAddEntertainment'
import { Film, Users, Eye, TrendingUp, LucideIcon, Download } from 'lucide-react'
import { exportEntertainmentExcel, type EntertainmentStats } from '../../services/api'
import { toast } from 'react-toastify'
import { EntertainmentSheetImport } from '../EntertainmentSheetImport'

interface Props {
  callback: () => void
  baseType: 'movie' | 'music' | 'podcast'
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  parentId?: string
  initialStats: EntertainmentStats
}

interface IStatsOverviewProps {
  title: string
  value: string
  change?: {
    value: string
    isPositive: boolean
  }
  icon: LucideIcon
}

const typeLabels = {
  movie: 'Phim',
  music: 'Music',
  podcast: 'Podcast',
  series: 'Series (Phim bộ)',
  episode: 'Tập phim'
}

export default function EntertainmentHeader({ callback, baseType, type, parentId, initialStats }: Props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([])

  useEffect(() => {
    const { totalItems, interactions } = initialStats || ({} as EntertainmentStats)

    setStats([
      {
        title: `Tổng số ${typeLabels[type]}`,
        value: String(totalItems || 0),
        change: {
          value: `Cập nhật mới nhất`,
          isPositive: true
        },
        icon: Film
      },
      {
        title: 'Tổng số lượt tương tác',
        value: String(interactions?.total || 0),
        change: {
          value: `Lượt thích: ${interactions?.liked || 0}`,
          isPositive: true
        },
        icon: Users
      },
      {
        title: 'Lượt xem (Watched)',
        value: String(interactions?.watched || 0),
        change: {
          value: `Lượt xem nội dung`,
          isPositive: true
        },
        icon: Eye
      },
      {
        title: 'Tương tác tháng',
        value: String(interactions?.total || 0),
        change: {
          value: `Tổng quan`,
          isPositive: true
        },
        icon: TrendingUp
      }
    ])
  }, [initialStats, type])

  return (
    <header>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title={typeLabels[type]} subtitle={`Quản lý ${typeLabels[type]}`} />

        <div className="flex items-center gap-3">
          {type !== 'episode' && (
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
              onClick={async () => {
                try {
                  const blob = await exportEntertainmentExcel(baseType)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `entertainment-${baseType}.xlsx`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch {
                  toast.error('Xuất Excel thất bại')
                }
              }}
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          )}

          {type !== 'episode' && <EntertainmentSheetImport callback={callback} type={baseType} />}

          <SheetAddEntertainment callback={callback} defaultType={type} parentId={parentId} lockType={!!parentId} />
        </div>
      </div>
      <StatsGrid stats={stats} />
    </header>
  )
}
