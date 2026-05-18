import { Skeleton } from '@/components/ui/skeleton'

export default function loading() {
  return (
    <div className="space-y-10 pb-20">
      <div className="rounded-3xl p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-white/30 rounded" />
            <Skeleton className="h-12 w-[520px] max-w-full bg-white/40 rounded" />
            <Skeleton className="h-4 w-[640px] max-w-full bg-white/25 rounded" />
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72 bg-gray-200 rounded" />
            <Skeleton className="h-5 w-[420px] max-w-full bg-gray-200 rounded" />
          </div>
          <Skeleton className="h-10 w-44 bg-gray-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 bg-gray-200 rounded-2xl" />
                <Skeleton className="h-7 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-56 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-40 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 bg-gray-200 rounded-xl" />
                <Skeleton className="h-16 bg-gray-200 rounded-xl" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-28 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-28 bg-gray-200 rounded" />
              </div>
              <Skeleton className="h-12 w-full bg-gray-200 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
