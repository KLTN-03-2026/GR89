import { Skeleton } from "@/components/ui/skeleton"

export default function loading() {
  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </header>

      {/* Grid: Topics + Lessons */}
      <div className="grid grid-cols-[300px_1fr]">
        {/* Topics sidebar */}
        <div className="border-r border-gray-200 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Lessons area */}
        <div className="p-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-5">
                <Skeleton className="h-5 w-5 shrink-0" />
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </div>
            ))}
          </div>

          {/* Add lesson buttons skeleton */}
          <div className="mt-5 rounded-xl border-2 border-dashed border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
