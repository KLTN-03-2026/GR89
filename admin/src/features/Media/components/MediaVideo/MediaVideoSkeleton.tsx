import { Skeleton } from '@/components/ui/skeleton'

export function MediaVideoSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-white shadow-sm">
      <Skeleton className="w-full aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export function MediaVideoSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MediaVideoSkeleton key={i} />
      ))}
    </>
  )
}

