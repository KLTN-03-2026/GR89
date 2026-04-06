'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { columnsWriting } from '../table/WritingColumn'
import { useEffect, useState, useCallback } from 'react'
import { Writing } from '@/features/writing/types'
import { deleteMultipleWriting, getWritingListPaginated, updateMultipleWritingStatus } from '@/features/writing/services/api'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, RotateCcw, ChevronDown, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { WritingSortField, WritingSortOrder } from '../../types'

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
  const [isLoading, setIsLoading] = useState(false)
  const [writings, setWritings] = useState<Writing[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<WritingSortField>('orderIndex')
  const [sortOrder, setSortOrder] = useState<WritingSortOrder>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Writing[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const fetchWritings = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextLimit: number,
      nextIsActive: boolean | undefined,
      nextSortBy: WritingSortField,
      nextSortOrder: WritingSortOrder
    ) => {
      setIsLoading(true)
      try {
        const res = await getWritingListPaginated({
          page: nextPage,
          limit: nextLimit,
          search: nextSearch,
          sortBy: nextSortBy,
          sortOrder: nextSortOrder,
          isActive: nextIsActive,
        })

        setWritings(res.data || [])
        setPage(res.pagination?.page || nextPage)
        setLimit(res.pagination?.limit || nextLimit)
        setTotal(res.pagination?.total || 0)
        setPages(res.pagination?.pages || 0)
      } catch (error) {
        console.error('❌ Error fetching Writing:', error)
        setWritings([])
        setPage(nextPage)
        setLimit(nextLimit)
        setTotal(0)
        setPages(0)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchWritings(1, debouncedSearch, limit, isActive, sortBy, sortOrder)
    // Chỉ sync theo debouncedSearch; limit/isActive/sort xử lý ở handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, fetchWritings])

  useEffect(() => {
    if (!refresh) return
    fetchWritings(1, search, limit, isActive, sortBy, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  useEffect(() => {
    fetchWritings(1, '', 10, undefined, 'orderIndex', 'asc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    fetchWritings(newPage, search, limit, isActive, sortBy, sortOrder)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active' ? true : false
    setIsActive(newIsActive)
    setPage(1)
    fetchWritings(1, search, limit, newIsActive, sortBy, sortOrder)
  }

  const handleSort = (field: WritingSortField) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newSortOrder)
    setPage(1)
    fetchWritings(1, search, limit, isActive, field, newSortOrder)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    fetchWritings(1, search, newLimit, isActive, sortBy, sortOrder)
  }

  const clearAllFilters = () => {
    setSearch('')
    setIsActive(undefined)
    setSortBy('orderIndex')
    setSortOrder('asc')
    setLimit(10)
    setPage(1)
    fetchWritings(1, '', 10, undefined, 'orderIndex', 'asc')
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
      callback()
      fetchWritings(page, search, limit, isActive, sortBy, sortOrder)
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
        callback()
        fetchWritings(page, search, limit, isActive, sortBy, sortOrder)
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                  <Select
                    value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                    onValueChange={handleStatusFilter}
                  >
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                  <Select value={sortBy} onValueChange={(value: WritingSortField) => handleSort(value)}>
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

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="gap-2">
                      <X className="h-4 w-4" />
                      Đóng
                    </Button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Hiển thị {writings.length} trong {total} kết quả
                </div>
              </div>
            </div>
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
              page: page,
              limit: limit,
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
