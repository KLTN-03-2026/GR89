import { IQuickAction, ROUTES } from "@/constants/routes";
import QuickActionCard from "./QuickActionCard";
import type { IDailySuggestion } from "../types";
import * as Icons from "lucide-react";

interface QuickActionsProps {
  dailySuggestion: IDailySuggestion | null
}

export function QuickActions({ dailySuggestion }: QuickActionsProps) {
  let actions: IQuickAction[] = ROUTES.QUICK_ACTIONS;

  if (dailySuggestion && Array.isArray(dailySuggestion.suggestions) && dailySuggestion.suggestions.length > 0) {
    actions = dailySuggestion.suggestions.map((item) => {
      // Safely grab icon from lucide-react or fallback to PlayCircle
      const IconComp = item.icon && (Icons as any)[item.icon] ? (Icons as any)[item.icon] : Icons.PlayCircle;
      return {
        title: item.title,
        description: item.description,
        href: item.href,
        Icon: IconComp,
        color: item.color || "from-blue-500 to-cyan-500",
        progress: item.progress || 0,
        isCompleted: item.isCompleted || false,
      }
    });
  }

  return (
    <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-1">
          🎯 Mục tiêu hôm nay
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành các nhiệm vụ để tăng điểm</p>
      </div>

      <div className="space-y-3">
        {actions.map((action: IQuickAction, index: number) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  )
}
