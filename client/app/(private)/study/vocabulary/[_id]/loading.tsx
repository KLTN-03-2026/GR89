import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="min-h-[600px]">
      <div className="mb-4">
        <Skeleton className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-52 md:h-64 bg-gray-200 dark:bg-gray-700">
          <Skeleton className="absolute inset-0 w-full h-full" />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <Skeleton className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          <div className='grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 mt-4'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-20 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

