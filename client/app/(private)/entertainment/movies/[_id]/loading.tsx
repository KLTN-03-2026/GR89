import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <Skeleton className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <Skeleton className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <Skeleton className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}

