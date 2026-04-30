'use client'

import { WelcomeSection } from "@/components/common/WelcomeSection";
import { CATEGORY_CONFIGS } from "../mockData";
import { CategoryType } from "../types";
import { Users, BookOpen, Clock, Target } from "lucide-react";

interface CategoryHeaderProps {
  type: CategoryType;
}

export function CategoryHeader({ type }: CategoryHeaderProps) {
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

  const statsOverview = [
    { title: 'Lớp tại trung tâm', value: '24', change: 'Đang mở', Icon: BookOpen, color: 'from-blue-500 to-blue-400' },
    { title: 'Học viên trực tiếp', value: '350+', change: '+20 mới', Icon: Users, color: 'from-purple-500 to-purple-400' },
    { title: 'Tỷ lệ đầu ra', value: '98%', change: 'Cam kết IELTS', Icon: Target, color: 'from-orange-500 to-orange-400' },
    { title: 'Giảng viên', value: '15+', change: '8.0+ IELTS', Icon: Clock, color: 'from-emerald-500 to-emerald-400' },
  ];

  const streakCard = {
    icon: "",
    title: "Hệ thống",
    color: "text-white",
    valueText: "ActiveLearning Center",
    progress: 100,
    progressDescription: "Quản lý đào tạo chuyên nghiệp"
  };

  // Override streakCard with welcomeIcon if needed
  const CustomWelcomeSection = () => {
    const WelcomeIcon = config.welcomeIcon;
    return (
      <WelcomeSection
        welcomeContent={welcomeContent}
        statsOverview={statsOverview}
        streakCard={{
          ...streakCard,
          icon: <WelcomeIcon className="w-8 h-8" /> as any
        }}
      />
    );
  };

  return <CustomWelcomeSection />;
}
