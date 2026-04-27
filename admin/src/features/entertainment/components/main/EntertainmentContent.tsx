'use client'
import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/common'
import { columnsEntertainment } from '@/features/entertainment'
import { getEntertainmentPaginated, deleteManyEntertainment, updateMultipleEntertainmentStatus } from '../../services/api'
import type { Entertainment } from '../../types'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Eye, EyeOff, Filter, ChevronDown } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import FiltersPanel from './FiltersPanel'

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

interface Props {
  refresh: boolean
  callback: () => void
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  parentId?: string
  onManageEpisodes?: (parentId: string, title: string) => void
}

export default function EntertainmentContent({ refresh, callback, type, parentId, onManageEpisodes }: Props) {
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
  const [items, setItems] = useState<Entertainment[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Entertainment[]>([])
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

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: urlPage,
        limit: urlLimit,
        search: urlSearch || undefined,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        status: urlIsActive,
        type: type === 'series' || type === 'episode' ? undefined : type
      }
      if (parentId) params.parentId = parentId

      const res = await getEntertainmentPaginated(params)
      setItems(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } catch (error) {
      console.error('❌ Error fetching:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive, type, parentId])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, refresh])

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
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục để xóa')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      await deleteManyEntertainment(ids)
      toast.success(`Đã xóa ${ids.length} mục thành công`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      fetchData()
      callback()
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('unpublish')
    setOpenPublishDialog(true)
  }

  const handlePublishManyConfirm = async () => {
    if (selectedRows.length === 0) return
    setLoadingAction(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      const newStatus = publishAction === 'publish'
      const res = await updateMultipleEntertainmentStatus(ids, newStatus)
      if (res.success) {
        toast.success(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} ${res.data?.updatedCount || 0} mục`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        fetchData()
        callback()
      }
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 ml-auto">
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
          itemsLength={items.length}
          total={total}
        />
      )}

      <DataTable
        data={items}
        isLoading={isLoading}
        serverSidePagination
        pagination={{
          page: urlPage,
          limit: urlLimit,
          total: total,
          pages: pages
        }}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        columns={columnsEntertainment(() => {
          fetchData()
          callback()
        }, onManageEpisodes)}
        columnNameSearch="title"
        handleDeleteMultiple={handleDeleteMultiple}
        handlePublishMultiple={handlePublishMany}
        handleUnpublishMultiple={handleUnpublishMany}
      />

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> mục đã chọn không? Hành động này không thể hoàn tác.
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
            <DialogTitle>{publishAction === 'publish' ? 'Hiển thị' : 'Ẩn'} nhiều mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'hiển thị' : 'ẩn'} <strong>{selectedRows.length}</strong> mục đã chọn không?
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
                      Hiển thị
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

