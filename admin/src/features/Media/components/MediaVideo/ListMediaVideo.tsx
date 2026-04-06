'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'
import VideoCard from './VideoCard'
import { DialogAddVideo } from '@/components/common'
import { Media } from '@/features/Media/types';
import { getMediaList } from '@/features/Media/services/api'
import { MediaVideoSkeletonGrid } from './MediaVideoSkeleton'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ListMediaVideo() {
  const [videos, setVideoes] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [pages, setPages] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchMedia = async (nextPage = page, nextLimit = limit) => {
      setIsLoading(true)
      await getMediaList({ page: nextPage, limit: nextLimit, type: 'video', sortBy: 'createdAt', sortOrder: 'desc' })
        .then((res) => {
          setVideoes(res.data?.filter(item => item.type === 'video') as Media[])
          setPage(res.pagination.page || nextPage)
          setPages(res.pagination.pages || 0)
          setTotal(res.pagination.total || 0)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    fetchMedia()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1) return
    if (pages && nextPage > pages) return
    setPage(nextPage)
    setIsLoading(true)
    try {
      const res = await getMediaList({ page: nextPage, limit, type: 'video', sortBy: 'createdAt', sortOrder: 'desc' })
      setVideoes(res.data?.filter(item => item.type === 'video') as Media[])
      setPage(res.pagination.page || nextPage)
      setPages(res.pagination.pages || pages)
      setTotal(res.pagination.total || total)
    } catch {
      toast.error('Không thể tải danh sách video')
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
    setVideoes(prev => prev.map(v => v._id === id ? { ...v, duration: Math.round(duration) } : v))
  }

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
                {[6, 12, 18, 24, 48, 96].map(size => (
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

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 items-stretch min-h-[400px]">
            <DialogAddVideo />
            {isLoading ? (
              <MediaVideoSkeletonGrid count={8} />
            ) : videos.filter(v => v.type === 'video').length > 0 ? (
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
