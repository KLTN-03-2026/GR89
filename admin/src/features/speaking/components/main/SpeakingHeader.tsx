'use client'
import { useState, useEffect } from 'react'
import { DialogAddSpeaking, PageHeader, StatsGrid } from "@/components/common";
import { Mic, Users, Eye, TrendingUp, LucideIcon, Download } from "lucide-react";
import { getSpeakingOverviewStats, exportSpeakingExcel } from "@/features/speaking/services/api";
import { SpeakingStatsSkeleton } from "@/components/common/Skeletons/SpeakingStatsSkeleton";
import { SpeakingSheetImport } from '../SpeakingSheetImport'

interface props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
}

export default function SpeakingHeader({ callback, initialStats }: { callback: () => void, initialStats: any }) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialStats) {
      setStats([
        {
          title: "Tổng Bài Nói",
          value: initialStats.totalLessons?.toString() || '0',
          change: {
            value: `+${Math.floor(Math.random() * 3) + 1} so với tháng trước`,
            isPositive: true
          },
          icon: Mic
        },
        {
          title: "Tổng Người Học",
          value: initialStats.totalUsers?.toString() || '0',
          change: {
            value: `+${Math.floor(Math.random() * 25) + 8} trong tháng này`,
            isPositive: true
          },
          icon: Users
        },
        {
          title: "Tỷ Lệ Hoàn Thành",
          value: `${initialStats.completionRate}%`,
          change: {
            value: `${initialStats.monthlyChange >= 0 ? '+' : ''}${initialStats.monthlyChange}% so với tháng trước`,
            isPositive: initialStats.monthlyChange >= 0
          },
          icon: Eye
        },
        {
          title: "Điểm Trung Bình",
          value: `${initialStats.avgSpeakingScore}%`,
          change: {
            value: `+${Math.floor(Math.random() * 8) + 3}%`,
            isPositive: true
          },
          icon: TrendingUp
        }
      ]);
    }
  }, [initialStats]);

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Bài Nói"
          subtitle="Quản lý bài tập nói tiếng Anh"
        />

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              const blob = await exportSpeakingExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'speaking_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <SpeakingSheetImport callback={callback} />
          <DialogAddSpeaking callback={callback} />
        </div>
      </div>

      {loading ? (
        <SpeakingStatsSkeleton />
      ) : (
        <StatsGrid stats={stats} />
      )}
    </header>
  );
}
