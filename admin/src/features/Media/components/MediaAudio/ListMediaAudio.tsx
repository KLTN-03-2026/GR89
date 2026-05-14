'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useCallback, useEffect, useState } from 'react'
import AudioCard from './AudioCard';
import { DialogAddAudio } from '@/components/common';
import { Media } from '@/features/Media/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export function ListMediaAudio({ initialData, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [audioes, setAudioes] = useState<Media[]>(initialData)

  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setAudioes(initialData)
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
    const safeLimit = (ALLOWED_LIMITS as readonly number[]).includes(nextLimit) ? nextLimit as typeof ALLOWED_LIMITS[number] : 12
    updateUrl({ limit: safeLimit, page: 1 })
  }

  const onMeta = (id: string, duration?: number) => {
    if (!duration || isNaN(duration)) return
    setAudioes(prev => prev.map(a => a._id === id ? { ...a, duration: Math.round(duration) } : a))
  }

  useEffect(() => {
    if (!(ALLOWED_LIMITS as readonly number[]).includes(limit)) {
      updateUrl({ limit: 12, page: 1 })
    }
  }, [limit, updateUrl])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Quản lý Audio</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="text-sm text-muted-foreground">
              Đang xem {audioes.length} / {total || audioes.length} audio
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
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={pages ? page >= pages : audioes.length < limit}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid max-h-xs grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 items-stretch">
            <DialogAddAudio callback={() => router.refresh()} />
            {audioes.length > 0 ? (
              audioes.map(a => (
                <AudioCard
                  onLoading={() => { }}
                  key={a._id}
                  item={a}
                  onMeta={(d) => onMeta(a._id, d)}
                  callback={() => router.refresh()}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p>Chưa có audio nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
