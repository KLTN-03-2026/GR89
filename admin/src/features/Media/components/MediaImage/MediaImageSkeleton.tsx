import { Skeleton } from '@/components/ui/skeleton'

export function MediaImageSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-white shadow-sm">
      <Skeleton className="w-full aspect-square" />
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12 bg-white/30" />
          <Skeleton className="h-3 w-16 bg-white/30" />
        </div>
      </div>
    </div>
  )
}

export function MediaImageSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MediaImageSkeleton key={i} />
      ))}
    </>
  )
}

