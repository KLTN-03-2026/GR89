import { Skeleton } from '@/components/ui/skeleton'

export default function loading() {
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white border-b border-gray-100 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-20 bg-gray-200 rounded-full" />
                <Skeleton className="h-4 w-44 bg-gray-200 rounded" />
              </div>
              <Skeleton className="h-10 w-[520px] max-w-full bg-gray-200 rounded" />
              <Skeleton className="h-5 w-[680px] max-w-full bg-gray-200 rounded" />

              <div className="flex flex-wrap gap-6 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24 bg-gray-200 rounded" />
                      <Skeleton className="h-4 w-40 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-72 rounded-3xl p-8 bg-blue-600">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-10 bg-white/20 rounded-xl" />
                <Skeleton className="h-4 w-20 bg-white/20 rounded" />
              </div>
              <Skeleton className="h-9 w-40 bg-white/30 rounded mb-2" />
              <Skeleton className="h-4 w-36 bg-white/20 rounded" />
              <div className="w-full h-2 bg-white/20 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-white/60 w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-44 bg-gray-200 rounded-2xl" />
          <Skeleton className="h-10 w-44 bg-gray-200 rounded-2xl" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-48 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 bg-gray-200 rounded" />
                <Skeleton className="h-9 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
