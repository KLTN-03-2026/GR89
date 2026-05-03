'use client'
import { DataTable } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columnsReading } from "../ReadingTable/ReadingColumn";
import { useEffect, useState, useCallback } from "react";
import { Reading } from "@/features/reading/types";
import { deleteMultipleReading, getReadingListPaginated, updateMultipleReadingStatus } from '@/features/reading/services/api';
import { toast } from "react-toastify";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FiltersPanel from './FiltersPanel';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface props {
  refresh: boolean
  callback: () => void
}

export default function ReadingContent({ refresh, callback }: props) {
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
  const urlSortBy = ['orderIndex', 'title', 'createdAt', 'updatedAt'].includes(rawSortBy || '') ? (rawSortBy as 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') : 'orderIndex'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as 'asc' | 'desc') : 'asc'

  const [isLoading, setIsLoading] = useState(false)
  const [readings, setReadings] = useState<Reading[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Reading[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  // Debounce search input
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

  const fetchReadings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getReadingListPaginated({
        page: urlPage,
        limit: urlLimit,
        search: urlSearch,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        isActive: urlIsActive
      })

      setReadings(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } catch (error) {
      console.error('❌ Error fetching readings:', error)
      setReadings([])
      setTotal(0)
      setPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive])

  useEffect(() => {
    fetchReadings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReadings, refresh])

  // Count active filters
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

  const handleDeleteMultipleReading = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài đọc để xóa')
      return
    }
    const selected = readings.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map(row => String(row._id))
      await deleteMultipleReading(ids)
      toast.success(`Đã xóa ${ids.length} bài đọc thành công`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      callback()
      fetchReadings()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa bài đọc thất bại'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài đọc')
      return
    }
    const selected = readings.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài đọc')
      return
    }
    const selected = readings.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('unpublish')
    setOpenPublishDialog(true)
  }

  const handlePublishManyConfirm = async () => {
    if (selectedRows.length === 0) return
    setLoadingAction(true)
    try {
      const ids = selectedRows.map(row => String(row._id))
      const newIsActive = publishAction === 'publish'
      const res = await updateMultipleReadingStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} bài đọc`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        callback()
        fetchReadings()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `${publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} thất bại`
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  // Optimistic update cho swap order
  const handleSwapOrder = (readingId: string, direction: 'up' | 'down') => {
    const currentReading = readings.find(r => r._id === readingId)
    if (!currentReading) return

    let adjacentReading: Reading | undefined
    if (direction === 'up') {
      const readingsWithSmallerIndex = readings.filter(r => r.orderIndex < currentReading.orderIndex)
      if (readingsWithSmallerIndex.length === 0) return
      adjacentReading = readingsWithSmallerIndex.reduce((prev, curr) =>
        curr.orderIndex > prev.orderIndex ? curr : prev
      )
    } else {
      const readingsWithLargerIndex = readings.filter(r => r.orderIndex > currentReading.orderIndex)
      if (readingsWithLargerIndex.length === 0) return
      adjacentReading = readingsWithLargerIndex.reduce((prev, curr) =>
        curr.orderIndex < prev.orderIndex ? curr : prev
      )
    }

    if (!adjacentReading) return

    setReadings(prevReadings =>
      prevReadings.map(r => {
        if (r._id === readingId) {
          return { ...r, orderIndex: adjacentReading!.orderIndex }
        }
        if (r._id === adjacentReading!._id) {
          return { ...r, orderIndex: currentReading.orderIndex }
        }
        return r
      }).sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quản lý bài đọc</CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {activeFiltersCount} bộ lọc
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
                {showFilters ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Advanced Filters Panel */}
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
              readingsLength={readings.length}
              total={total}
            />
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsReading(callback, router, readings, handleSwapOrder)}
            data={readings}
            isLoading={isLoading}
            columnNameSearch="Tiêu đề"
            handleDeleteMultiple={handleDeleteMultipleReading}
            handlePublishMultiple={handlePublishMany}
            handleUnpublishMultiple={handleUnpublishMany}
            serverSidePagination
            pagination={{
              page: urlPage,
              limit: urlLimit,
              total: total,
              pages: pages
            }}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
          />
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa nhiều */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều bài đọc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> bài đọc đã chọn không?
              Hành động này sẽ xóa toàn bộ dữ liệu liên quan và không thể hoàn tác.
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
            <Button
              variant="destructive"
              onClick={confirmDeleteMultiple}
              disabled={isDeleting}
            >
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

      {/* Dialog xác nhận xuất bản/ẩn nhiều */}
      <Dialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều bài đọc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> bài đọc đã chọn không?
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
            <Button
              variant="default"
              onClick={handlePublishManyConfirm}
              disabled={loadingAction}
            >
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