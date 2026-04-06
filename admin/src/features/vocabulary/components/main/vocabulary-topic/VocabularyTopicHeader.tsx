'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from "@/components/common";
import {
  getVocabularyOverviewStats,
  exportVocabularyExcel,
} from "@/features/vocabulary/services/api";
import { VocabularySheetImport } from "@/features/vocabulary/components/VocabularySheetImport";
import { BookOpen, Users, Eye, TrendingUp, LucideIcon, Download } from "lucide-react";
import { VocabularyStatsSkeleton } from "@/components/common/Skeletons/VocabularyStatsSkeleton";
import { SheetAddVocabularyTopic } from '../../dialog';

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
              title: "Tổng Danh Mục",
              value: data?.totalTopics?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 5) + 1} so với tháng trước`,
                isPositive: true
              },
              icon: BookOpen
            },
            {
              title: "Tổng Từ Vựng",
              value: data?.totalWords?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 100) + 50} so với tháng trước`,
                isPositive: true
              },
              icon: Users
            },
            {
              title: "Lượt Học Tháng",
              value: `${data && (data?.monthlyLearns / 1000).toFixed(1)}K`,
              change: {
                value: `${data && data?.monthlyChange >= 0 ? '+' : ''}${data?.monthlyChange}% so với tháng trước`,
                isPositive: data && data?.monthlyChange >= 0 || false
              },
              icon: Eye
            },
            {
              title: "Tỷ Lệ Hoàn Thành",
              value: `${data && data?.completionRate}%`,
              change: {
                value: `+${Math.floor(Math.random() * 5) + 1}% so với tháng trước`,
                isPositive: true
              },
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
        <StatsGrid stats={stats} />
      )}
    </header>
  );
}
