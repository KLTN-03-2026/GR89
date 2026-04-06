import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[600px]">
      {/* Header skeleton */}
      <div className="relative mb-5 p-2">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-64 md:w-96 rounded" />
        </div>
        <Skeleton className="h-4 w-full max-w-2xl rounded mt-2" />
        <Skeleton className="h-4 w-3/4 max-w-xl rounded mt-2" />
      </div>

      {/* Main content skeleton */}
      <div className="w-full mx-auto flex flex-col xl:flex-row gap-5">
        <div className="w-full rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-40 rounded" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-10 w-28 rounded" />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-full rounded" />
            <Skeleton className="h-6 w-5/6 rounded" />
            <Skeleton className="h-6 w-4/6 rounded" />
            <div className="space-y-2 mt-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="xl:max-w-sm w-full flex flex-col gap-5">
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
