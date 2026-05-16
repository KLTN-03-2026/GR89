'use client'
import type { Pagination } from '@/lib/apis/fetch-server'
import { usePathname, useRouter } from 'next/navigation'
import EntertainmentContent from './EntertainmentContent'
import EntertainmentHeader from './EntertainmentHeader'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import type { EntertainmentStats } from '../../services/api'
import type { Entertainment } from '../../types'

interface Props {
  baseType: 'movie' | 'music' | 'podcast'
  type: 'movie' | 'music' | 'podcast' | 'episode'
  parentId?: string
  parentTitle?: string
  initialData: Entertainment[]
  pagination: Pagination
  initialStats: EntertainmentStats
}

export function EntertainmentMain({
  baseType,
  type,
  parentId,
  parentTitle,
  initialData,
  pagination,
  initialStats
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {parentId ? (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.delete('parentId')
              params.set('page', '1')
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại danh sách
          </Button>
          <h2 className="text-xl font-bold italic text-primary">Tập phim của: {parentTitle}</h2>
        </div>
      ) : null}

      <EntertainmentHeader
        callback={() => router.refresh()}
        type={type}
        baseType={baseType}
        initialStats={initialStats}
      />

      <EntertainmentContent
        callback={() => router.refresh()}
        baseType={baseType}
        type={type}
        parentId={parentId}
        initialData={initialData}
        pagination={pagination}
        onManageEpisodes={(nextParentId, _title) => {
          const params = new URLSearchParams(window.location.search)
          params.set('parentId', nextParentId)
          params.set('page', '1')
          router.push(`${pathname}?${params.toString()}`)
        }}
      />
    </div>
  )
}
