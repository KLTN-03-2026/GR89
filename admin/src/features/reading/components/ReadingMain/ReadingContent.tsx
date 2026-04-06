'use client'
import { DataTable } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columnsReading } from "../ReadingTable/ReadingColumn";
import { useEffect, useState, useCallback } from "react";
import { Reading } from "@/features/reading/types";
import { deleteMultipleReading, getReadingListPaginated, updateMultipleReadingStatus } from '@/features/reading/services/api';
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RotateCcw, ChevronDown, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isLoading, setIsLoading] = useState(false)
  const [readings, setReadings] = useState<Reading[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'orderIndex' | 'title' | 'createdAt' | 'updatedAt'>('orderIndex')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Reading[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)
  const router = useRouter()

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  const fetchReadings = useCallback(async (nextPage: number, nextSearch: string, nextLimit: number, nextIsActive: boolean | undefined, nextSortBy: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt', nextSortOrder: 'asc' | 'desc') => {
    setIsLoading(true)
    await getReadingListPaginated({
      page: nextPage,
      limit: nextLimit,
      search: nextSearch,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
      isActive: nextIsActive
    })
      .then(res => {
        setReadings(res.data || [])
        setPage(res.pagination?.page || nextPage)
        setLimit(res.pagination?.limit || nextLimit)
        setTotal(res.pagination?.total || 0)
        setPages(res.pagination?.pages || 0)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Effect for debounced search - only trigger when debounced search changes
  useEffect(() => {
    fetchReadings(1, debouncedSearch, limit, isActive, sortBy, sortOrder)
  }, [debouncedSearch, fetchReadings, isActive, limit, sortBy, sortOrder])

  // Effect for refresh - only trigger when refresh changes
  useEffect(() => {
    if (!refresh) return
    fetchReadings(1, search, limit, isActive, sortBy, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  // Initial load
  useEffect(() => {
    fetchReadings(1, "", 10, undefined, 'orderIndex', 'asc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Count active filters
  useEffect(() => {
    let count = 0
    if (search) count++
    if (isActive !== undefined) count++
    if (sortBy !== 'orderIndex') count++
    if (sortOrder !== 'asc') count++
    setActiveFiltersCount(count)
  }, [search, isActive, sortBy, sortOrder])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) {
      return
    }
    setPage(newPage)
    fetchReadings(newPage, search, limit, isActive, sortBy, sortOrder)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Don't call fetchReadings here - let debounced effect handle it
  }

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active' ? true : false
    setIsActive(newIsActive)
    setPage(1) // Reset to first page
    fetchReadings(1, search, limit, newIsActive, sortBy, sortOrder)
  }

  const handleSort = (field: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page
    fetchReadings(1, search, limit, isActive, field, newSortOrder)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page
    fetchReadings(1, search, newLimit, isActive, sortBy, sortOrder)
  }

  const clearAllFilters = () => {
    setSearch("")
    setIsActive(undefined)
    setSortBy('orderIndex')
    setSortOrder('asc')
    setLimit(10) // Reset page size to default
    setPage(1)
    fetchReadings(1, "", 10, undefined, 'orderIndex', 'asc')
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
      fetchReadings(page, search, limit, isActive, sortBy, sortOrder)
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
        fetchReadings(page, search, limit, isActive, sortBy, sortOrder)
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo tiêu đề, mô tả..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                  <Select value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                  <Select value={sortBy} onValueChange={(value: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') => handleSort(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orderIndex">Thứ tự</SelectItem>
                      <SelectItem value="title">Tiêu đề</SelectItem>
                      <SelectItem value="createdAt">Ngày tạo</SelectItem>
                      <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số lượng/trang</label>
                  <Select value={limit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5/trang</SelectItem>
                      <SelectItem value="10">10/trang</SelectItem>
                      <SelectItem value="20">20/trang</SelectItem>
                      <SelectItem value="50">50/trang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Đóng
                    </Button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Hiển thị {readings.length} trong {total} kết quả
                </div>
              </div>
            </div>
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
              page: page,
              limit: limit,
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