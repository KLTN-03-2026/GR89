'use client'
import { useRouter } from 'next/navigation'
import type { Pagination } from '@/lib/apis/fetch-server'
import type { Reading, ReadingOverviewStats } from '@/features/reading/types'
import ReadingContent from './ReadingContent'
import ReadingHeader from './ReadingHeader'

interface ReadingMainProps {
  initialData: Reading[]
  pagination: Pagination
  initialStats: ReadingOverviewStats
}

export function ReadingMain({ initialData, pagination, initialStats }: ReadingMainProps) {
  const router = useRouter()

  return (
    <div>
      <ReadingHeader callback={() => router.refresh()} initialStats={initialStats} />
      <ReadingContent initialData={initialData} pagination={pagination} callback={() => router.refresh()} />
    </div>
  )
}
