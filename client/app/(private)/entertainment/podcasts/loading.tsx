import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <>
      <section className="mb-5">
        <div className={`flex items-center gap-4 justify-between w-full rounded-2xl px-8 py-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-200`}>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-6 bg-white/30 rounded" />
            <Skeleton className="h-10 w-80 bg-white/50 rounded" />
            <Skeleton className="h-4 w-[600px] bg-white/30 rounded" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 w-48 bg-white/60 rounded" />
              <Skeleton className="h-10 w-40 bg-white/30 rounded" />
            </div>
          </div>
          <div className="hidden xl:block w-[280px] h-[180px] bg-emerald-600/30 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <Skeleton className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg" />
              <Skeleton className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-3" />
              <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

