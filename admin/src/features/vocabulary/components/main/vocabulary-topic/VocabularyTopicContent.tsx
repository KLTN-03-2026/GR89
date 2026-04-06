'use client'
import { DataTable } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columnsVocabularyTopic } from "../../table/vocabulary-topic/VocabularyTopicColumn";
import { useEffect, useState, useCallback } from "react";
import { VocabularyTopic } from "@/features/vocabulary/types";
import { getVocabularyTopicsPaginated, deleteManyVocabularyTopics, updateManyVocabularyTopicsStatus } from "@/features/vocabulary/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";

interface props {
  refresh: boolean
  callback: () => void
}

// Custom hook for debouncing
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

export default function VocabularyTopicContent({ refresh, callback }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<VocabularyTopic[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'orderIndex' | 'name' | 'createdAt' | 'updatedAt'>('orderIndex')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState<VocabularyTopic[]>([])
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  const fetchTopics = useCallback(async (nextPage: number, nextSearch: string, nextLimit: number, nextIsActive: boolean | undefined, nextSortBy: 'orderIndex' | 'name' | 'createdAt' | 'updatedAt', nextSortOrder: 'asc' | 'desc') => {
    setIsLoading(true)
    try {
      const res = await getVocabularyTopicsPaginated({
        page: nextPage,
        limit: nextLimit,
        search: nextSearch,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
        isActive: nextIsActive
      })

      setTopics(res.data || [])
      setPage(res.pagination?.page || 1)
      setLimit(res.pagination?.limit || 10)
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } catch (error) {
      console.error('❌ Error fetching vocabulary topics:', error)
      setTopics([])
      setPage(1)
      setLimit(10)
      setTotal(0)
      setPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect for debounced search - only trigger when debounced search changes
  useEffect(() => {
    fetchTopics(1, debouncedSearch, limit, isActive, sortBy, sortOrder)
  }, [debouncedSearch, fetchTopics, isActive, limit, sortBy, sortOrder])

  // Effect for other filters (status, sort, page size) - trigger immediately
  useEffect(() => {
    if (debouncedSearch === search) { // Only if search is not being debounced
      fetchTopics(1, search, limit, isActive, sortBy, sortOrder)
    }
  }, [limit, isActive, sortBy, sortOrder, fetchTopics, search, debouncedSearch])

  // Effect for refresh - trigger when refresh changes
  useEffect(() => {
    fetchTopics(1, search, limit, isActive, sortBy, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  // Initial load
  useEffect(() => {
    fetchTopics(1, "", 10, undefined, 'orderIndex', 'asc')
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
    fetchTopics(newPage, search, limit, isActive, sortBy, sortOrder)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Don't call fetchTopics here - let debounced effect handle it
  }

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active'
    setIsActive(newIsActive)
    setPage(1) // Reset to first page
    fetchTopics(1, search, limit, newIsActive, sortBy, sortOrder)
  }

  const handleSort = (field: 'orderIndex' | 'name' | 'createdAt' | 'updatedAt') => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page
    fetchTopics(1, search, limit, isActive, field, newSortOrder)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page
    fetchTopics(1, search, newLimit, isActive, sortBy, sortOrder)
  }

  const clearAllFilters = () => {
    setSearch("")
    setIsActive(undefined)
    setSortBy('orderIndex')
    setSortOrder('asc')
    setPage(1)
    fetchTopics(1, "", limit, undefined, 'orderIndex', 'asc')
  }

  const handleDeleteMultiple = (ids: string[]) => {
    setSelectedIds(ids)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      const res = await deleteManyVocabularyTopics(selectedIds)
      toast.success(`Đã xóa ${res.data?.deletedCount || 0} chủ đề từ vựng thành công`)
      setOpenDeleteDialog(false)
      setSelectedIds([])
      callback() // Refresh parent component
      fetchTopics(page, search, limit, isActive, sortBy, sortOrder)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa chủ đề từ vựng không thành công'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một chủ đề')
      return
    }
    // Update selectedRows from IDs
    const selected = topics.filter(t => ids.includes(String(t._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một chủ đề')
      return
    }
    // Update selectedRows from IDs
    const selected = topics.filter(t => ids.includes(String(t._id)))
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
      const res = await updateManyVocabularyTopicsStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} chủ đề từ vựng`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        callback()
        fetchTopics(page, search, limit, isActive, sortBy, sortOrder)
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `${publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} thất bại`
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  // Optimistic update cho swap order - cập nhật ngay lập tức không cần reload
  const handleSwapOrder = (topicId: string, direction: 'up' | 'down') => {
    const currentTopic = topics.find(t => t._id === topicId)
    if (!currentTopic) return

    // Tìm topic liền kề
    let adjacentTopic: VocabularyTopic | undefined
    if (direction === 'up') {
      // Tìm topic có orderIndex nhỏ hơn gần nhất
      const topicsWithSmallerIndex = topics.filter(t => t.orderIndex < currentTopic.orderIndex)
      if (topicsWithSmallerIndex.length === 0) return
      adjacentTopic = topicsWithSmallerIndex.reduce((prev, curr) =>
        curr.orderIndex > prev.orderIndex ? curr : prev
      )
    } else {
      // Tìm topic có orderIndex lớn hơn gần nhất
      const topicsWithLargerIndex = topics.filter(t => t.orderIndex > currentTopic.orderIndex)
      if (topicsWithLargerIndex.length === 0) return
      adjacentTopic = topicsWithLargerIndex.reduce((prev, curr) =>
        curr.orderIndex < prev.orderIndex ? curr : prev
      )
    }

    if (!adjacentTopic) return

    // Hoán đổi orderIndex ngay lập tức
    setTopics(prevTopics =>
      prevTopics.map(t => {
        if (t._id === topicId) {
          return { ...t, orderIndex: adjacentTopic!.orderIndex }
        }
        if (t._id === adjacentTopic!._id) {
          return { ...t, orderIndex: currentTopic.orderIndex }
        }
        return t
      }).sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quản lý chủ đề từ vựng</CardTitle>
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
                      placeholder="Tìm theo tên chủ đề..."
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
                  <Select value={sortBy} onValueChange={(value: 'orderIndex' | 'name' | 'createdAt' | 'updatedAt') => handleSort(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orderIndex">Thứ tự</SelectItem>
                      <SelectItem value="name">Tên chủ đề</SelectItem>
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
                  Hiển thị {topics.length} trong {total} kết quả
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsVocabularyTopic(callback, topics, handleSwapOrder)}
            data={topics}
            isLoading={isLoading}
            columnNameSearch="Tên chủ đề"
            serverSidePagination
            pagination={{
              page: page,
              limit: limit,
              total: total,
              pages: pages
            }}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            handleDeleteMultiple={handleDeleteMultiple}
            handlePublishMultiple={handlePublishMany}
            handleUnpublishMultiple={handleUnpublishMany}
          />
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa nhiều */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều chủ đề từ vựng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedIds.length}</strong> chủ đề từ vựng đã chọn không?
              Hành động này sẽ xóa tất cả từ vựng và quiz liên quan. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setSelectedIds([])
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
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều chủ đề từ vựng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> chủ đề từ vựng đã chọn không?
              {publishAction === 'publish' && ' Các chủ đề cần có ít nhất 10 từ vựng mới có thể xuất bản.'}
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
  );
}
