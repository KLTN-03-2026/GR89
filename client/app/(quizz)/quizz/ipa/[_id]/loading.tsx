import { Skeleton } from '@/components/ui/skeleton'

export default function loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <Skeleton className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <Skeleton className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

