import { SpeakingMain } from '@/features/speaking'
import { getSpeakingListServer, getSpeakingOverviewStatsServer } from '@/features/speaking/services/serverApi'
import React from 'react'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    isActive?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const {
    page = '1',
    limit = '10',
    search = '',
    sortBy = 'orderIndex',
    sortOrder = 'asc',
    isActive
  } = await searchParams

  const [response, stats] = await Promise.all([
    getSpeakingListServer({
      page: Number(page),
      limit: Number(limit),
      search,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    }),
    getSpeakingOverviewStatsServer()
  ])

  return (
    <div>
      <SpeakingMain 
        initialData={response.data}
        pagination={response.pagination}
        initialStats={stats}
      />
    </div>
  )
}
