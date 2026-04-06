'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'
import AudioCard from './AudioCard';
import { DialogAddAudio } from '@/components/common';
import { Media } from '@/features/Media/types';
import { getMediaList } from '@/features/Media/services/api';
import { MediaAudioSkeletonGrid } from './MediaAudioSkeleton';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ListMediaAudio() {
  const [audioes, setAudioes] = useState<Media[]>([])
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [pages, setPages] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchMedia = async (nextPage = page, nextLimit = limit) => {
      setIsLoading(true)
      await getMediaList({ page: nextPage, limit: nextLimit, type: 'audio', sortBy: 'createdAt', sortOrder: 'desc' })
        .then((res) => {
          setAudioes(res.data?.filter(item => item.type === 'audio') as Media[])
          setPage(res.pagination.page || nextPage)
          setPages(res.pagination.pages || 0)
          setTotal(res.pagination.total || 0)
        })
        .finally(() => {
          setIsLoading(false)
        })

    }
    fetchMedia()
  }, [limit, page, refresh])

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1) return
    if (pages && nextPage > pages) return
    setPage(nextPage)
    setIsLoading(true)
    try {
      const res = await getMediaList({ page: nextPage, limit, type: 'audio', sortBy: 'createdAt', sortOrder: 'desc' })
      setAudioes(res.data?.filter(item => item.type === 'audio') as Media[])
      setPage(res.pagination.page || nextPage)
      setPages(res.pagination.pages || pages)
      setTotal(res.pagination.total || total)
    } catch {
      toast.error('Không thể tải danh sách audio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit)
    handlePageChange(1)
  }

  const onMeta = (id: string, duration?: number) => {
    if (!duration || isNaN(duration)) return
    setAudioes(prev => prev.map(a => a._id === id ? { ...a, duration: Math.round(duration) } : a))
  }

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
                {[6, 12, 18, 24, 48, 96].map(size => (
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
            <DialogAddAudio callback={() => setRefresh(!refresh)} />
            {isLoading ? (
              <MediaAudioSkeletonGrid count={6} />
            ) : audioes.length > 0 ? (
              audioes.map(a => (
                <AudioCard
                  onLoading={() => { }}
                  key={a._id}
                  item={a}
                  onMeta={(d) => onMeta(a._id, d)}
                  callback={() => setRefresh(!refresh)}
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
