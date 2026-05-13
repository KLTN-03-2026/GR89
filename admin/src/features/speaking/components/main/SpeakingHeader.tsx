'use client'
import { useState, useEffect } from 'react'
import { DialogAddSpeaking, PageHeader, StatsGrid } from "@/components/common";
import { Mic, Users, Eye, TrendingUp, LucideIcon, Download } from "lucide-react";
import { exportSpeakingExcel, SpeakingOverviewStats } from "@/features/speaking/services/api";
import { SpeakingSheetImport } from '../SpeakingSheetImport'

interface IStatsOverviewProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function SpeakingHeader({ callback, initialStats }: { callback: () => void, initialStats: SpeakingOverviewStats }) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);

  useEffect(() => {
    if (initialStats) {
      setStats([
        {
          title: "Tổng Bài Nói",
          value: initialStats.totalLessons?.toString() || '0',
          icon: Mic
        },
        {
          title: "Tổng Người Học",
          value: initialStats.totalUsers?.toString() || '0',
          icon: Users
        },
        {
          title: "Tỷ Lệ Hoàn Thành",
          value: `${initialStats.completionRate}%`,
          icon: Eye
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

      <StatsGrid stats={stats} columns={3}/>
    </header>
  );
}
