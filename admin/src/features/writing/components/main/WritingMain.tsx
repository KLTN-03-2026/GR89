'use client'
import { useRouter } from 'next/navigation'
import WritingContent from './WritingContent'
import WritingHeader from './WritingHeader'
import type { Pagination } from '@/lib/apis/fetch-server'
import type { Writing } from '@/features/writing/types'
import type { WritingOverviewStats } from '@/features/writing/services/api'

interface WritingMainProps {
  initialData: Writing[]
  pagination: Pagination
  initialStats: WritingOverviewStats
}

export function WritingMain({ initialData, pagination, initialStats }: WritingMainProps) {
  const router = useRouter()

  return (
    <div>
      <WritingHeader callback={() => router.refresh()} initialStats={initialStats} />
      <WritingContent initialData={initialData} pagination={pagination} callback={() => router.refresh()} />
    </div>
  )
}
