import { Skeleton } from '@/components/ui/skeleton'

export function MediaAudioSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-white shadow-sm p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </div>
  )
}

export function MediaAudioSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MediaAudioSkeleton key={i} />
      ))}
    </>
  )
}

