import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}

