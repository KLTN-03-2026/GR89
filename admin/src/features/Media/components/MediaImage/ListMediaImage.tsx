'use client'
import { DialogAddImageCard, DialogImageData } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteMedias } from '@/features/Media/services/api';
import { Media } from '@/features/Media/types';
import { Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

const ALLOWED_LIMITS = [6, 12, 18, 24, 48, 96] as const

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

export function ListMediaImage({ initialData, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Media | null>(null)
  const [images, setImages] = useState<Media[]>(initialData)
  const [isDeleting, setIsDeleting] = useState(false)

  const page = pagination.page
  const limit = pagination.limit
  const pages = pagination.pages
  const total = pagination.total

  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setImages(initialData)
    setPrevInitialData(initialData)
    setSelectedIds(new Set())
    setPreview(null)
  }

  const updateUrl = useCallback((updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') params.delete(key)
      else params.set(key, String(value))
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    const rawLimit = Number(searchParams.get('limit') || limit)
    if (!ALLOWED_LIMITS.includes(rawLimit as 6 | 12 | 18 | 24 | 48 | 96)) {
      updateUrl({ limit: 12, page: 1 })
    }
  }, [limit, searchParams, updateUrl])

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
        updateUrl({ page: page - 1 })
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('[MediaImages] delete selected error', error)
      toast.error('Không thể xóa ảnh đã chọn. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1) return
    const maxPage = pages > 0 ? pages : Math.max(1, Math.ceil(total / limit))
    if (nextPage > maxPage) return
    updateUrl({ page: nextPage })
  }

  const handleLimitChange = (nextLimit: number) => {
    const safeLimit = ALLOWED_LIMITS.includes(nextLimit as 6 | 12 | 18 | 24 | 48 | 96) ? nextLimit : 12
    updateUrl({ limit: safeLimit, page: 1 })
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
              {ALLOWED_LIMITS.map(size => (
                <option key={size} value={size}>{size} / trang</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">Trang {page} / {pages || 1}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= (pages > 0 ? pages : Math.max(1, Math.ceil(total / limit)))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          <DialogAddImageCard onLoad={() => router.refresh()} />
          {images && images.length > 0 ? (
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

                <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-medium">
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
