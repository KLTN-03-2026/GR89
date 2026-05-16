'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { DialogAddWriting } from '@/features/writing'
import { PenTool, Users, Eye, LucideIcon, Download } from 'lucide-react'
import { exportWritingExcel, WritingOverviewStats } from '@/features/writing/services/api'
import { WritingSheetImport } from '../WritingSheetImport'

interface Props {
  callback: () => void
  initialStats: WritingOverviewStats
}

interface IStatsOverviewProps {
  title: string
  value: string
  icon: LucideIcon
}

export default function WritingHeader({ callback, initialStats }: Props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([])

  useEffect(() => {
    if (!initialStats) return
    setStats([
      {
        title: 'Tổng Bài Viết',
        value: initialStats.totalLessons?.toString() || '0',
        icon: PenTool,
      },
      {
        title: 'Tổng Người Học',
        value: initialStats.totalUsers?.toString() || '0',
        icon: Users,
      },
      {
        title: 'Tỷ Lệ Hoàn Thành',
        value: `${initialStats.completionRate}%`,
        icon: Eye,
      }
    ])
  }, [initialStats])

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Bài Viết" subtitle="Quản lý bài tập viết" />
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              const blob = await exportWritingExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'writing_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <WritingSheetImport callback={callback} />
          <DialogAddWriting callback={callback} />
        </div>
      </div>

      <StatsGrid stats={stats} columns={3}/>
    </header>
  )
}
