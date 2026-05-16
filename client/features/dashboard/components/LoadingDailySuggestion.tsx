import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingDailySuggestion() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 sm:mt-0 ml-14 sm:ml-0">
            <Skeleton className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
