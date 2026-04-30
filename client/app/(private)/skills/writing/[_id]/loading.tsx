import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <Skeleton className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <Skeleton className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="xl:col-span-2">
          <Skeleton className="h-[600px] w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

