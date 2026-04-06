import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-800 to-blue-500 text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-28 bg-white/30 rounded" />
            <Skeleton className="h-12 w-80 bg-white/50 rounded" />
            <Skeleton className="h-4 w-[520px] bg-white/30 rounded" />
            <Skeleton className="h-4 w-[420px] bg-white/20 rounded" />
            <div className="flex gap-3 mt-3">
              <Skeleton className="h-9 w-36 bg-white/60 rounded" />
              <Skeleton className="h-9 w-36 bg-white/30 rounded" />
            </div>
          </div>
          <Skeleton className="hidden xl:block w-[320px] h-[200px] bg-white/20 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
        <div className="xl:col-span-2 space-y-4">
          <Skeleton className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </section>
  )
}
