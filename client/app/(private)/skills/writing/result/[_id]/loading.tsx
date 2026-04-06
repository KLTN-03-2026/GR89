import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

