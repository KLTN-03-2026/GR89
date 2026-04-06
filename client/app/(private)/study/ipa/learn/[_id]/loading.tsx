import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[600px]">
      {/* Header skeleton */}
      <div className="relative mb-5 p-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-10 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="w-full mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <Skeleton className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-64 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  )
}

