import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <Skeleton className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Skeleton className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  )
}

