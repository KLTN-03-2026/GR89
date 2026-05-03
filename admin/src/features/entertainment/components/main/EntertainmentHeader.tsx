'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { SheetAddEntertainment } from '../dialog/SheetAddEntertainment'
import { Film, Users, Eye, TrendingUp, LucideIcon, Download } from 'lucide-react'
import { exportEntertainmentExcel, getEntertainmentStats } from '../../services/api'
import { toast } from 'react-toastify'
import { EntertainmentSheetImport } from '../EntertainmentSheetImport'

interface Props {
  callback: () => void
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  parentId?: string
}

interface IStatsOverviewProps {
  title: string
  value: string
  change: {
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

export default function EntertainmentHeader({ callback, type, parentId }: Props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getEntertainmentStats(type)
        if (res.success && res.data) {
          const { totalItems, interactions } = res.data

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
          return
        }
      } catch (error) {
        console.error('Failed to fetch entertainment stats:', error)
      }

      // Fallback
      setStats([
        {
          title: `Tổng số ${typeLabels[type]}`,
          value: '0',
          change: {
            value: `+0 so với tháng trước`,
            isPositive: true
          },
          icon: Film
        },
        {
          title: 'Tổng số người xem',
          value: '0',
          change: {
            value: `+0 trong tháng này`,
            isPositive: true
          },
          icon: Users
        },
        {
          title: 'Tỉ lệ hoàn thành',
          value: '0%',
          change: {
            value: `+0% so với tháng trước`,
            isPositive: true
          },
          icon: Eye
        },
        {
          title: 'Lượt xem tháng',
          value: '0',
          change: {
            value: `+0%`,
            isPositive: true
          },
          icon: TrendingUp
        }
      ])
    }

    fetchStats()
  }, [type])

  return (
    <header>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title={typeLabels[type]} subtitle={`Quản lý ${typeLabels[type]}`} />

        <div className="flex items-center gap-3">
          {!parentId && (
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
              onClick={async () => {
                try {
                  const blob = await exportEntertainmentExcel(type as any)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `entertainment-${type}.xlsx`
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

          {!parentId && <EntertainmentSheetImport callback={callback} type={type as any} />}

          <SheetAddEntertainment callback={callback} defaultType={type} parentId={parentId} lockType={!!parentId} />
        </div>
      </div>
      <StatsGrid stats={stats} />
    </header>
  )
}

