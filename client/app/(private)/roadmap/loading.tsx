import { Skeleton } from '@/components/ui/skeleton'

export default function RoadmapLoading() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-10">
      {/* Topic header skeleton */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-sky-400 to-blue-500 space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-32 h-32 rounded-full bg-white/30" />
          <Skeleton className="h-7 w-48 bg-white/40 rounded" />
          <Skeleton className="h-4 w-64 bg-white/25 rounded" />
          <Skeleton className="h-3 w-full bg-white/20 rounded-full" />
          <Skeleton className="h-4 w-24 bg-white/30 rounded" />
        </div>
      </div>

      {/* Lesson nodes skeleton */}
      <div className="flex flex-col items-center gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            {i > 0 && <Skeleton className="w-1 h-12 bg-gray-200 rounded-full" />}
            <Skeleton className="w-24 h-24 rounded-full bg-gray-200" />
            <Skeleton className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
