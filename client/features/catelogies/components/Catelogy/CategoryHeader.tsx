'use client'

import { WelcomeSection } from "@/components/common/WelcomeSection";
import { CategoryType } from "../../types";
import type { IStatsOverview } from "@/types";
import { Users, BookOpen, Clock, Target } from "lucide-react";
import { CATEGORY_CONFIGS } from "@/features/catelogies/mockData";

interface CategoryHeaderProps {
  type: CategoryType;
  statsOverview?: IStatsOverview[];
}

export function CategoryHeader({ type, statsOverview }: CategoryHeaderProps) {
  const config = CATEGORY_CONFIGS[type];

  const welcomeContent = {
    hightlightColor: config.highlightColor,
    Icon: config.icon,
    title: config.title,
    titleHighlight: config.titleHighlight,
    badge: "Trung tâm Anh ngữ",
    badge2: "Học tại cơ sở",
    descriptions: [
      { text: "Chào mừng bạn đến với hệ thống quản lý học viên trực tiếp của ", textHighlight: "ActiveLearning" },
      { text: ". Nơi đào tạo IELTS và tiếng Anh giao tiếp chuẩn quốc tế với lộ trình cá nhân hóa." }
    ],
    background: config.welcomeBackground
  };

  const fallbackStatsOverview: IStatsOverview[] = [
    { title: 'Tổng lớp', value: '—', change: 'Đang cập nhật', Icon: BookOpen, color: 'from-blue-500 to-blue-400' },
    { title: 'Tổng học viên', value: '—', change: 'Đang cập nhật', Icon: Users, color: 'from-purple-500 to-purple-400' },
    { title: 'Tổng học viên (catelogies)', value: '—', change: 'Đang cập nhật', Icon: Target, color: 'from-orange-500 to-orange-400' },
    { title: 'Giảng viên đang dạy', value: '—', change: 'Đang cập nhật', Icon: Clock, color: 'from-emerald-500 to-emerald-400' },
  ];

  const resolvedStatsOverview = statsOverview?.length ? statsOverview : fallbackStatsOverview;

  const CustomWelcomeSection = () => {
    return (
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={resolvedStatsOverview}
      />
    );
  };

  return <CustomWelcomeSection />;
}
