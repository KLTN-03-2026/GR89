import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <Skeleton className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
        </div>
        <Skeleton className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-5 shadow-sm">
            <Skeleton className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/90 dark:bg-gray-900/40 p-6 shadow-sm">
          <Skeleton className="w-44 h-44 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
          <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

