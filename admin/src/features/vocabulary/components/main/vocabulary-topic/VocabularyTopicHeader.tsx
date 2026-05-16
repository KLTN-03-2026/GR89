'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from "@/components/common";
import {
  getVocabularyOverviewStats,
  exportVocabularyExcel,
} from "@/features/vocabulary/services/api";
import { VocabularySheetImport } from "@/features/vocabulary/components/VocabularySheetImport";
import { BookOpen, Users, TrendingUp, LucideIcon, Download } from "lucide-react";
import { VocabularyStatsSkeleton } from "@/components/common/Skeletons/VocabularyStatsSkeleton";
import { SheetAddVocabularyTopic } from '../../dialog';

interface props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function VocabularyTopicHeader({ callback }: props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVocabularyStats = async () => {
      setLoading(true);
      await getVocabularyOverviewStats()
        .then(res => {
          const data = res.data;
          setStats([
            {
              title: "Tổng Chủ Đề Từ Vựng",
              value: data?.totalLessons?.toString() || '0',
              icon: BookOpen
            },
            {
              title: "Tổng Từ Vựng",
              value: data?.totalWords?.toString() || '0',
              icon: Users
            },
            {
              title: "Tỷ Lệ Hoàn Thành",
              value: `${data && data?.completionRate}%`,
              icon: TrendingUp
            }
          ]);
        })
        .finally(() => {
          setLoading(false);
        })
    };

    fetchVocabularyStats();
  }, []);

  return (
    <header>
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Từ Vựng"
          subtitle="Quản lý chủ đề từ vựng"
        />

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
            onClick={async () => {
              const blob = await exportVocabularyExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'vocabulary_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <VocabularySheetImport callback={callback} />
          <SheetAddVocabularyTopic callback={callback} />
        </div>
      </div>

      {loading ? (
        <VocabularyStatsSkeleton />
      ) : (
        <StatsGrid stats={stats} columns={3}/>
      )}
    </header>
  );
}
