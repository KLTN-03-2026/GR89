import QuickActionCard from "./QuickActionCard";
import type { IDailySuggestion, IDailySuggestionItem } from "../types";
import LoadingDailySuggestion from "@/features/dashboard/components/LoadingDailySuggestion";

interface QuickActionsProps {
  dailySuggestion: IDailySuggestion | null
  isLoading: boolean
}

export function QuickActions({ dailySuggestion, isLoading }: QuickActionsProps) {

  return (
    <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-1">
            🎯 Mục tiêu hôm nay
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hoàn thành các nhiệm vụ để tăng điểm
          </p>
        </div>

        {!isLoading && (
          <div className="shrink-0 text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700 rounded-full px-2.5 py-1">
            {dailySuggestion?.suggestions?.length || 0} nhiệm vụ
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <LoadingDailySuggestion />
        ) : dailySuggestion && dailySuggestion?.suggestions?.length > 0 ? (
          dailySuggestion.suggestions.map((item: IDailySuggestionItem, index: number) => (
            <QuickActionCard key={index} {...item} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Chưa có mục tiêu hôm nay
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Thử tải lại trang để nhận gợi ý mới.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
