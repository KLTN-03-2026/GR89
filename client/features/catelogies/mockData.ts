import { ICategoryConfig } from "@/features/catelogies/types";
import { Baby, Briefcase, GraduationCap, Palette, ShieldCheck, Star } from "lucide-react";

export const CATEGORY_CONFIGS: Record<string, ICategoryConfig> = {
  kids: {
    title: "ActiveLearning",
    titleHighlight: "Kids Academy",
    icon: Baby,
    welcomeIcon: Palette,
    gradient: "from-amber-400 to-orange-500",
    welcomeBackground: "from-amber-400 via-orange-400 to-orange-500",
    highlightColor: "text-orange-600",
  },
  teenager: {
    title: "ActiveLearning",
    titleHighlight: "IELTS Fighter",
    icon: GraduationCap,
    welcomeIcon: Star,
    gradient: "from-sky-400 to-indigo-600",
    welcomeBackground: "from-sky-400 via-blue-500 to-indigo-600",
    highlightColor: "text-blue-600",
  },
  adult: {
    title: "ActiveLearning",
    titleHighlight: "Professional",
    icon: Briefcase,
    welcomeIcon: ShieldCheck,
    gradient: "from-red-400 to-red-600",
    welcomeBackground: "from-red-400 via-red-500 to-red-600",
    highlightColor: "text-red-100",
  },
};