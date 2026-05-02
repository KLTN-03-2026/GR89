'use client'
import { DataTable } from "@/components/common"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useCallback } from "react"
import { columnsListening } from "../table/ListeningColumn"
import { Listening } from "@/features/listening/types"
import { deleteMultipleListening, updateMultipleListeningStatus } from "@/features/listening/services/api"
import { toast } from "react-toastify"
import ListeningHeader from "./ListeningHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, ChevronDown, Loader2, Trash2, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import FiltersPanel from "./FiltersPanel"

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

interface ListeningMainProps {
  initialData: Listening[]
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

export function ListeningMain({ initialData, pagination }: ListeningMainProps) {
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
  const [items, setItems] = useState<Listening[]>(initialData)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Listening[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  // Derived state
  const total = pagination.total
  const pages = pagination.pages
  const activeFiltersCount = [
    urlSearch,
    urlIsActive !== undefined,
    urlSortBy !== 'orderIndex',
    urlSortOrder !== 'asc'
  ].filter(Boolean).length

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  // Cập nhật state khi prop initialData thay đổi (do Server Component fetch lại)
  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setItems(initialData)
    setPrevInitialData(initialData)
  }

  // Đồng bộ ngược từ URL vào input khi người dùng điều hướng (Back/Forward)
  useEffect(() => {
    if (urlSearch !== search) {
      setSearch(urlSearch)
    }
  }, [urlSearch])

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

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch, urlSearch, updateUrl])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) {
      return
    }
    updateUrl({ page: newPage })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleDeleteMultipleListening = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài nghe để xóa')
      return
    }
    const selected = items.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map(row => String(row._id))
      await deleteMultipleListening(ids)
      toast.success(`Đã xóa ${ids.length} bài nghe thành công`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa bài nghe thất bại'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài nghe')
      return
    }
    const selected = items.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài nghe')
      return
    }
    const selected = items.filter(item => ids.includes(String(item._id)))
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
      const res = await updateMultipleListeningStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} bài nghe`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        router.refresh()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `${publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} thất bại`
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  // Optimistic update cho swap order
  const handleSwapOrder = (listeningId: string, direction: 'up' | 'down') => {
    const currentListening = items.find(l => l._id === listeningId)
    if (!currentListening) return

    let adjacentListening: Listening | undefined
    if (direction === 'up') {
      const itemsWithSmallerIndex = items.filter(l => l.orderIndex < currentListening.orderIndex)
      if (itemsWithSmallerIndex.length === 0) return
      adjacentListening = itemsWithSmallerIndex.reduce((prev, curr) =>
        curr.orderIndex > prev.orderIndex ? curr : prev
      )
    } else {
      const itemsWithLargerIndex = items.filter(l => l.orderIndex > currentListening.orderIndex)
      if (itemsWithLargerIndex.length === 0) return
      adjacentListening = itemsWithLargerIndex.reduce((prev, curr) =>
        curr.orderIndex < prev.orderIndex ? curr : prev
      )
    }

    if (!adjacentListening) return

    setItems(prevItems =>
      prevItems.map(l => {
        if (l._id === listeningId) {
          return { ...l, orderIndex: adjacentListening!.orderIndex }
        }
        if (l._id === adjacentListening!._id) {
          return { ...l, orderIndex: currentListening.orderIndex }
        }
        return l
      }).sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }

  return (
    <>
      <ListeningHeader callback={() => router.refresh()} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quản lý bài nghe</CardTitle>
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
              itemsLength={items.length}
              total={total}
            />
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsListening(() => router.refresh(), items, handleSwapOrder)}
            data={items}
            isLoading={isLoading}
            columnNameSearch="Tiêu đề bài nghe"
            handleDeleteMultiple={handleDeleteMultipleListening}
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
            onSelectedRowsChange={(rows) => setSelectedRows(rows as Listening[])}
          />
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa nhiều */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều bài nghe</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> bài nghe đã chọn không?
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
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều bài nghe</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> bài nghe đã chọn không?
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


