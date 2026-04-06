import { IQuickAction, ROUTES } from "@/constants/routes";
import QuickActionCard from "./QuickActionCard";

export function QuickActions() {
  return (
    <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-1">
          🎯 Mục tiêu hôm nay
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành các nhiệm vụ để tăng điểm</p>
      </div>

      <div className="space-y-3">
        {ROUTES.QUICK_ACTIONS.map((action: IQuickAction, index: number) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  )
}
