'use client'
import { DialogAddImageCard, DialogImageData } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteMedias, getMediaList } from '@/features/Media/services/api';
import { Media } from '@/features/Media/types';
import { Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { MediaImageSkeletonGrid } from './MediaImageSkeleton';

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export function ListMediaImage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryPage = parsePositiveInt(searchParams.get('page'), 1)
  const queryLimit = parsePositiveInt(searchParams.get('limit'), 12)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Media | null>(null)
  const [images, setImages] = useState<Media[]>([])
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(queryPage)
  const [limit, setLimit] = useState(queryLimit)
  const [pages, setPages] = useState(0)
  const [total, setTotal] = useState(0)

  const updateQuery = useCallback((nextPage: number, nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('limit', String(nextLimit))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const fetchMedia = useCallback(async (nextPage: number, nextLimit: number) => {
    setIsLoading(true)
    try {
      const res = await getMediaList({ page: nextPage, limit: nextLimit, type: 'image', sortBy: 'createdAt', sortOrder: 'desc' })
      setImages(res.data?.filter(item => item.type === 'image') as Media[])
      setPages(res.pagination.pages || 0)
      setTotal(res.pagination.total || 0)
    } catch {
      toast.error('Không thể tải danh sách ảnh')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (queryPage !== page) setPage(queryPage)
    if (queryLimit !== limit) setLimit(queryLimit)
  }, [queryPage, queryLimit, page, limit])

  useEffect(() => {
    fetchMedia(page, limit)
  }, [fetchMedia, page, limit, refresh])

  const toggleSelect = (image: Media) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(image._id)) next.delete(image._id)
      else next.add(image._id)
      return next
    })
  }

  const isSelected = (id: string) => selectedIds.has(id)
  const allSelectableCount = images.length
  const isAllSelected = allSelectableCount > 0 && selectedIds.size === allSelectableCount

  const handleToggleSelectAll = () => {
    setSelectedIds(() => {
      if (isAllSelected) return new Set()
      return new Set(images.map(img => img._id))
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const confirmMessage = isAllSelected
      ? `Bạn chắc chắn muốn xóa TẤT CẢ ${ids.length} ảnh?`
      : `Xóa ${ids.length} ảnh đã chọn?`
    if (!confirm(confirmMessage)) return
    setIsDeleting(true)
    try {
      const batchSize = 100
      const aggregate = {
        requested: ids.length,
        deleted: 0,
        linked: [] as string[],
        notAllowedOrMissing: [] as string[],
        skipped: 0
      }

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize)
        const res = await deleteMedias(batch)
        const data = res.data
        if (data) {
          aggregate.deleted += data.deleted || 0
          aggregate.skipped += data.skipped || 0
          aggregate.linked.push(...(data.linked || []))
          aggregate.notAllowedOrMissing.push(...(data.notAllowedOrMissing || []))
        }
      }

      const nextImages = images.filter(img => !ids.includes(img._id))
      setImages(nextImages)
      setSelectedIds(new Set())

      const msg = [
        `Đã xóa: ${aggregate.deleted}/${aggregate.requested}`,
        aggregate.linked.length ? `Đang liên kết: ${aggregate.linked.length}` : '',
        aggregate.notAllowedOrMissing.length ? `Không hợp lệ/không thuộc quyền: ${aggregate.notAllowedOrMissing.length}` : ''
      ].filter(Boolean).join(' · ')
      toast.success(msg || 'Đã xóa ảnh đã chọn')

      // Nếu trang hiện tại trống sau khi xóa, lùi về trang trước; nếu không thì reload trang hiện tại
      if (nextImages.length === 0 && page > 1) {
        const prevPage = page - 1
        setPage(prevPage)
        updateQuery(prevPage, limit)
      } else {
        fetchMedia(page, limit)
      }
    } catch (error) {
      console.error('[MediaImages] delete selected error', error)
      toast.error('Không thể xóa ảnh đã chọn. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageChange = async (nextPage: number) => {
    if (isLoading) return
    if (nextPage < 1) return
    const maxPage = pages > 0 ? pages : Math.max(1, Math.ceil(total / limit))
    if (nextPage > maxPage) return
    setPage(nextPage)
    updateQuery(nextPage, limit)
  }

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
    updateQuery(1, nextLimit)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý hình ảnh</CardTitle>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelectAll}
            >
              {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          )}
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-600"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isDeleting ? 'Đang xóa...' : `Xóa (${selectedIds.size})`}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="text-sm text-muted-foreground">
            Đang xem {images.length} / {total || images.length} ảnh
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
              <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1 || isLoading}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">Trang {page} / {pages || 1}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => !isLoading && handlePageChange(page + 1)}
                disabled={page >= (pages > 0 ? pages : Math.max(1, Math.ceil(total / limit))) || isLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          <DialogAddImageCard onLoad={() => setRefresh(!refresh)} />
          {isLoading ? (
            <MediaImageSkeletonGrid count={12} />
          ) : images && images.length > 0 ? (
            images.map(img => (
              <div
                key={img._id}
                className="relative group rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(img) }}
                  className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border flex items-center justify-center bg-white/80 backdrop-blur-sm ${isSelected(img._id) ? 'border-blue-600' : 'border-gray-300'}`}
                  aria-label={isSelected(img._id) ? 'Bỏ chọn' : 'Chọn ảnh'}
                >
                  {isSelected(img._id) && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button type="button" className="block w-full" onClick={() => setPreview(img)} aria-label="Xem chi tiết ảnh">
                  <Image
                    src={img.url}
                    alt={`image-${img._id}`}
                    width={img.width || 400}
                    height={img.height || 400}
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-medium">
                  <div className="flex items-center justify-between">
                    <span className="uppercase">{img.format || 'UNK'}</span>
                    <span>{img.createdAt ? new Date(img.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                  </div>
                  {(img.width && img.height) && (
                    <div className="text-center mt-1 text-[9px] text-white/80">
                      {img.width} × {img.height}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p>Chưa có hình ảnh nào</p>
            </div>
          )}
        </div>
      </CardContent>

      <DialogImageData
        setImages={setImages}
        setSelectedIds={setSelectedIds}
        setPreview={setPreview}
        preview={preview} />
    </Card>
  )
}
