'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { columnsWriting } from '../table/WritingColumn'
import { useEffect, useState, useCallback } from 'react'
import { Writing } from '@/features/writing/types'
import { deleteMultipleWriting, getWritingListPaginated, updateMultipleWritingStatus } from '@/features/writing/services/api'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, ChevronDown, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { WritingSortField, WritingSortOrder } from '../../types'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import FiltersPanel from './FiltersPanel'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface props {
  refresh: boolean
  callback: () => void
}

export default function WritingContent({ refresh, callback }: props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawSortBy = searchParams.get('sortBy')
  const rawSortOrder = searchParams.get('sortOrder')
  const rawIsActive = searchParams.get('isActive')

  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = [5, 10, 20, 50].includes(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 10
  const urlSearch = searchParams.get('search') || ""
  const urlIsActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined
  const urlSortBy = ['orderIndex', 'title', 'createdAt', 'updatedAt'].includes(rawSortBy || '') ? (rawSortBy as WritingSortField) : 'orderIndex'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as WritingSortOrder) : 'asc'

  const [isLoading, setIsLoading] = useState(false)
  const [writings, setWritings] = useState<Writing[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Writing[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    if (urlSearch !== debouncedSearch) {
      setSearch(urlSearch)
    }
  }, [urlSearch, debouncedSearch])

  const updateUrl = useCallback((updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch, urlSearch, updateUrl])

  const fetchWritings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getWritingListPaginated({
        page: urlPage,
        limit: urlLimit,
        search: urlSearch,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        isActive: urlIsActive,
      })

      setWritings(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } catch (error) {
      console.error('❌ Error fetching Writing:', error)
      setWritings([])
      setTotal(0)
      setPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive])

  useEffect(() => {
    fetchWritings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWritings, refresh])

  useEffect(() => {
    let count = 0
    if (urlSearch) count++
    if (urlIsActive !== undefined) count++
    if (urlSortBy !== 'orderIndex') count++
    if (urlSortOrder !== 'asc') count++
    setActiveFiltersCount(count)
  }, [urlSearch, urlIsActive, urlSortBy, urlSortOrder])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) {
      return
    }
    updateUrl({ page: newPage })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleDeleteMultipleWriting = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài viết để xóa')
      return
    }
    const selected = writings.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      await deleteMultipleWriting(ids)
      toast.success(`Đã xóa ${ids.length} bài viết thành công`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      fetchWritings()
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa bài viết thất bại'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài viết')
      return
    }
    const selected = writings.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài viết')
      return
    }
    const selected = writings.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('unpublish')
    setOpenPublishDialog(true)
  }

  const handlePublishManyConfirm = async () => {
    if (selectedRows.length === 0) return
    setLoadingAction(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      const newIsActive = publishAction === 'publish'
      const res = await updateMultipleWritingStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} bài viết`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        fetchWritings()
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        `${publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} thất bại`
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleSwapOrder = (writingId: string, direction: 'up' | 'down') => {
    const currentWriting = writings.find((w) => w._id === writingId)
    if (!currentWriting) return

    let adjacentWriting: Writing | undefined
    if (direction === 'up') {
      const writingsWithSmallerIndex = writings.filter((w) => w.orderIndex < currentWriting.orderIndex)
      if (writingsWithSmallerIndex.length === 0) return
      adjacentWriting = writingsWithSmallerIndex.reduce((prev, curr) =>
        curr.orderIndex > prev.orderIndex ? curr : prev
      )
    } else {
      const writingsWithLargerIndex = writings.filter((w) => w.orderIndex > currentWriting.orderIndex)
      if (writingsWithLargerIndex.length === 0) return
      adjacentWriting = writingsWithLargerIndex.reduce((prev, curr) =>
        curr.orderIndex < prev.orderIndex ? curr : prev
      )
    }

    if (!adjacentWriting) return

    setWritings((prevWritings) =>
      prevWritings
        .map((w) => {
          if (w._id === writingId) {
            return { ...w, orderIndex: adjacentWriting!.orderIndex }
          }
          if (w._id === adjacentWriting!._id) {
            return { ...w, orderIndex: currentWriting.orderIndex }
          }
          return w
        })
        .sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quản lý bài viết</CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {activeFiltersCount} bộ lọc
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="h-4 w-4" />
                Bộ lọc
                {showFilters ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <FiltersPanel
              urlIsActive={urlIsActive}
              urlSortBy={urlSortBy}
              urlSortOrder={urlSortOrder}
              urlLimit={urlLimit}
              updateUrl={updateUrl}
              search={search}
              setSearch={setSearch}
              handleSearch={handleSearch}
              activeFiltersCount={activeFiltersCount}
              setShowFilters={setShowFilters}
              writingsLength={writings.length}
              total={total}
            />
          )}

          <DataTable
            columns={columnsWriting(callback, writings, handleSwapOrder)}
            data={writings}
            isLoading={isLoading}
            columnNameSearch="Tiêu đề"
            handleDeleteMultiple={handleDeleteMultipleWriting}
            handlePublishMultiple={handlePublishMany}
            handleUnpublishMultiple={handleUnpublishMany}
            serverSidePagination
            pagination={{
              page: urlPage,
              limit: urlLimit,
              total: total,
              pages: pages,
            }}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
          />
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> bài viết đã chọn không? Hành động này sẽ
              xóa toàn bộ dữ liệu liên quan và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setSelectedRows([])
              }}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMultiple} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'}{' '}
              <strong>{selectedRows.length}</strong> bài viết đã chọn không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenPublishDialog(false)
                setSelectedRows([])
              }}
              disabled={loadingAction}
            >
              Hủy
            </Button>
            <Button variant="default" onClick={handlePublishManyConfirm} disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {publishAction === 'publish' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Xuất bản
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ẩn
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
