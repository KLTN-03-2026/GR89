import { Skeleton } from '@/components/ui/skeleton'

export default function ReadingLessonLoading() {
  return (
    <div className="h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto h-full max-w-[1800px] space-y-4">
        <div className="flex items-center justify-between rounded-xl border bg-white p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="hidden h-[calc(100%-112px)] gap-4 md:grid md:grid-cols-[1fr_460px]">
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>

          <div className="rounded-xl border bg-white p-6 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
