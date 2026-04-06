'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { columnsGrammarTopic } from '../GrammarTopicTable/GrammarTopicColumn'
import { useEffect, useState, useCallback } from 'react'
import { GrammarTopic } from '@/features/grammar/types'
import { getGrammarTopicsPaginated, deleteManyGrammarTopics, updateManyGrammarTopicsStatus } from '../../services/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, RotateCcw, ChevronDown, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  refresh: boolean
  callback: () => void
}

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

export default function GrammarTopicContent({ refresh, callback }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<GrammarTopic[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'orderIndex' | 'title' | 'createdAt' | 'updatedAt'>('orderIndex')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<GrammarTopic[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const fetchTopics = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextLimit: number,
      nextIsActive: boolean | undefined,
      nextSortBy: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt',
      nextSortOrder: 'asc' | 'desc'
    ) => {
      setIsLoading(true)
      try {
        const res = await getGrammarTopicsPaginated({
          page: nextPage,
          limit: nextLimit,
          search: nextSearch,
          sortBy: nextSortBy,
          sortOrder: nextSortOrder,
          isActive: nextIsActive
        })
        setTopics(res.data)
        setPage(res.pagination.page)
        setLimit(res.pagination.limit)
        setTotal(res.pagination.total)
        setPages(res.pagination.pages)
      } catch {
        setTopics([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchTopics(1, debouncedSearch, limit, isActive, sortBy, sortOrder)
  }, [debouncedSearch, fetchTopics, isActive, limit, sortBy, sortOrder])

  useEffect(() => {
    if (debouncedSearch === search) {
      fetchTopics(1, search, limit, isActive, sortBy, sortOrder)
    }
  }, [limit, isActive, sortBy, sortOrder, fetchTopics, search, debouncedSearch])

  useEffect(() => {
    if (!refresh) return
    fetchTopics(1, search, limit, isActive, sortBy, sortOrder)
  }, [fetchTopics, isActive, limit, search, sortBy, sortOrder, refresh])

  useEffect(() => {
    fetchTopics(1, "", 10, undefined, 'orderIndex', 'asc')
  }, [fetchTopics])

  useEffect(() => {
    let count = 0
    if (search) count++
    if (isActive !== undefined) count++
    if (sortBy !== 'orderIndex') count++
    if (sortOrder !== 'asc') count++
    setActiveFiltersCount(count)
  }, [search, isActive, sortBy, sortOrder])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) return
    setPage(newPage)
    fetchTopics(newPage, search, limit, isActive, sortBy, sortOrder)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active'
    setIsActive(newIsActive)
    setPage(1)
    fetchTopics(1, search, limit, newIsActive, sortBy, sortOrder)
  }

  const handleSort = (field: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newSortOrder)
    setPage(1)
    fetchTopics(1, search, limit, isActive, field, newSortOrder)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    fetchTopics(1, search, newLimit, isActive, sortBy, sortOrder)
  }

  const clearAllFilters = () => {
    setSearch('')
    setIsActive(undefined)
    setSortBy('orderIndex')
    setSortOrder('asc')
    setPage(1)
    fetchTopics(1, '', limit, undefined, 'orderIndex', 'asc')
  }

  const handleDeleteMany = async (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một chủ đề để xóa')
      return
    }
    const selected = topics.filter((t) => ids.includes(String(t._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const handleDeleteManyConfirm = async () => {
    if (selectedRows.length === 0) return
    setLoadingAction(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      const res = await deleteManyGrammarTopics(ids)
      if (res.success) {
        toast.success(`Đã xóa ${res.data?.deletedCount || 0} chủ đề ngữ pháp`)
        setSelectedRows([])
        setOpenDeleteDialog(false)
        callback()
        fetchTopics(page, search, limit, isActive, sortBy, sortOrder)
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa chủ đề ngữ pháp không thành công'
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một chủ đề')
      return
    }
    const selected = topics.filter((t) => ids.includes(String(t._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một chủ đề')
      return
    }
    const selected = topics.filter((t) => ids.includes(String(t._id)))
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
      const res = await updateManyGrammarTopicsStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} chủ đề ngữ pháp`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        callback()
        fetchTopics(page, search, limit, isActive, sortBy, sortOrder)
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

  const handleSwapOrder = (topicId: string, direction: 'up' | 'down') => {
    const currentTopic = topics.find((t) => t._id === topicId)
    if (!currentTopic) return

    let adjacentTopic: GrammarTopic | undefined
    if (direction === 'up') {
      const topicsWithSmallerIndex = topics.filter((t) => t.orderIndex < currentTopic.orderIndex)
      if (topicsWithSmallerIndex.length === 0) return
      adjacentTopic = topicsWithSmallerIndex.reduce((prev, curr) => (curr.orderIndex > prev.orderIndex ? curr : prev))
    } else {
      const topicsWithLargerIndex = topics.filter((t) => t.orderIndex > currentTopic.orderIndex)
      if (topicsWithLargerIndex.length === 0) return
      adjacentTopic = topicsWithLargerIndex.reduce((prev, curr) => (curr.orderIndex < prev.orderIndex ? curr : prev))
    }

    if (!adjacentTopic) return

    setTopics((prevTopics) =>
      prevTopics
        .map((t) => {
          if (t._id === topicId) {
            return { ...t, orderIndex: adjacentTopic!.orderIndex }
          }
          if (t._id === adjacentTopic!._id) {
            return { ...t, orderIndex: currentTopic.orderIndex }
          }
          return t
        })
        .sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Quản lý chủ đề ngữ pháp</CardTitle>
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
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên, mô tả..."
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
                <Select value={sortBy} onValueChange={(value: 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') => handleSort(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orderIndex">Thứ tự</SelectItem>
                    <SelectItem value="title">Tên chủ đề</SelectItem>
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
                Hiển thị {topics.length} trong {total} kết quả
              </div>
            </div>
          </div>
        )}

        <DataTable
          columns={columnsGrammarTopic(callback, topics, handleSwapOrder)}
          data={topics}
          isLoading={isLoading}
          columnNameSearch="Tên chủ đề"
          serverSidePagination
          pagination={{ page, limit, total, pages }}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSelectedRowsChange={(rows) => setSelectedRows(rows as GrammarTopic[])}
          handleDeleteMultiple={handleDeleteMany}
          handlePublishMultiple={handlePublishMany}
          handleUnpublishMultiple={handleUnpublishMany}
        />

        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa nhiều chủ đề ngữ pháp</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> chủ đề ngữ pháp đã chọn không?
                Hành động này sẽ xóa tất cả câu chuyện, cấu trúc, cách sử dụng, mẹo, tương tác và quiz liên quan. Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDeleteDialog(false)
                  setSelectedRows([])
                }}
                disabled={loadingAction}
              >
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteManyConfirm} disabled={loadingAction}>
                {loadingAction ? (
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
              <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều chủ đề ngữ pháp</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> chủ đề ngữ pháp đã chọn không?
                {publishAction === 'publish' &&
                  ' Các chủ đề cần có ít nhất 1 câu chuyện, 1 cấu trúc, 1 cách sử dụng, 1 mẹo, 1 tương tác và 1 bài kiểm tra mới có thể xuất bản.'}
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
      </CardContent>
    </Card>
  )
}

