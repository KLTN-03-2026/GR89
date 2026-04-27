'use client'
import { DataTable } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columnsVocabularyTopic } from "../../table/vocabulary-topic/VocabularyTopicColumn";
import { useEffect, useState, useCallback } from "react";
import { VocabularyTopic } from "@/features/vocabulary/types";
import { getVocabularyTopicsPaginated, deleteManyVocabularyTopics, updateManyVocabularyTopicsStatus } from "@/features/vocabulary/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import FiltersPanel from './FiltersPanel';

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
  const urlSortBy = ['orderIndex', 'name', 'createdAt', 'updatedAt'].includes(rawSortBy || '') ? (rawSortBy as 'orderIndex' | 'name' | 'createdAt' | 'updatedAt') : 'orderIndex'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as 'asc' | 'desc') : 'asc'

  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<VocabularyTopic[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState(urlSearch)
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

  const fetchTopics = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getVocabularyTopicsPaginated({
        page: urlPage,
        limit: urlLimit,
        search: urlSearch,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        isActive: urlIsActive
      })

      setTopics(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } catch (error) {
      console.error('❌ Error fetching vocabulary topics:', error)
      setTopics([])
      setTotal(0)
      setPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive])

  // Effect for refresh - trigger when refresh changes
  useEffect(() => {
    fetchTopics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTopics, refresh])

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
      fetchTopics()
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
        fetchTopics()
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
              topicsLength={topics.length}
              total={total}
            />
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsVocabularyTopic(callback, topics, handleSwapOrder)}
            data={topics}
            isLoading={isLoading}
            columnNameSearch="Tên chủ đề"
            serverSidePagination
            pagination={{
              page: urlPage,
              limit: urlLimit,
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
