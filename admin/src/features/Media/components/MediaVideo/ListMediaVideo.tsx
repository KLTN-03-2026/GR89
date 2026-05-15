'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useCallback, useEffect, useState } from 'react'
import VideoCard from './VideoCard'
import { DialogAddVideo } from '@/components/common'
import { Media } from '@/features/Media/types';
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  initialData: Media[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    next: number | null
    prev: number | null
  }
}

const ALLOWED_LIMITS = [6, 12, 18, 24, 48, 96] as const

export function ListMediaVideo({ initialData, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [videos, setVideoes] = useState<Media[]>(initialData)

  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setVideoes(initialData)
    setPrevInitialData(initialData)
  }

  const updateUrl = useCallback((updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') params.delete(key)
      else params.set(key, String(value))
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const page = pagination.page
  const limit = pagination.limit
  const pages = pagination.pages
  const total = pagination.total

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return
    if (pages && nextPage > pages) return
    updateUrl({ page: nextPage })
  }

  const handleLimitChange = (nextLimit: number) => {
    const safeLimit = ALLOWED_LIMITS.includes(nextLimit as 6 | 12 | 18 | 24 | 48 | 96) ? nextLimit : 12
    updateUrl({ limit: safeLimit, page: 1 })
  }

  const onMeta = (id: string, duration?: number) => {
    if (!duration || isNaN(duration)) return
    setVideoes(prev => prev.map(v => v._id === id ? { ...v, duration: Math.round(duration) } : v))
  }

  useEffect(() => {
    if (!ALLOWED_LIMITS.includes(limit as 6 | 12 | 18 | 24 | 48 | 96)) {
      updateUrl({ limit: 12, page: 1 })
    }
  }, [limit, updateUrl])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Quản lý Video</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="text-sm text-muted-foreground">
              Đang xem {videos.length} / {total || videos.length} video
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                {ALLOWED_LIMITS.map(size => (
                  <option key={size} value={size}>{size} / trang</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Trang {page} / {pages || 1}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={pages ? page >= pages : videos.length < limit}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 items-stretch min-h-100">
            <DialogAddVideo onLoad={() => router.refresh()} />
            {videos.filter(v => v.type === 'video').length > 0 ? (
              videos.filter(v => v.type === 'video').map(v => (
                <VideoCard
                  key={v._id}
                  item={v}
                  onMeta={(duration?: number) => onMeta(v._id, duration)}
                  onLoading={() => { }}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p>Chưa có video nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
