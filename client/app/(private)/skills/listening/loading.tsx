import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <>
      <section className="mb-5">
        <div className={`flex items-center gap-4 justify-between w-full rounded-2xl px-8 py-12 bg-gradient-to-br from-pink-500 via-rose-500 to-red-200`}>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-6 bg-white/30 rounded" />
            <Skeleton className="h-10 w-80 bg-white/50 rounded" />
            <Skeleton className="h-4 w-[600px] bg-white/30 rounded" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 w-48 bg-white/60 rounded" />
              <Skeleton className="h-10 w-40 bg-white/30 rounded" />
            </div>
          </div>
          <div className="hidden xl:block w-[280px] h-[180px] bg-pink-600/30 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <Skeleton className="h-8 w-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg" />
              <Skeleton className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-3" />
              <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-pink-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 animate-pulse"
            >
              <div className="w-full h-40 bg-pink-100 dark:bg-pink-900/30 rounded-lg"></div>
              <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="w-1/3 h-2 bg-pink-200 dark:bg-pink-800 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

