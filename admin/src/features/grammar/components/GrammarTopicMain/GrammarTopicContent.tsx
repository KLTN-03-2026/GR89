'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { columnsGrammarTopic } from '../GrammarTopicTable/GrammarTopicColumn'
import { useEffect, useState } from 'react'
import { GrammarTopic } from '@/features/grammar/types'
import { deleteManyGrammarTopics, updateManyGrammarTopicsStatus } from '../../services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, ChevronDown, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import FiltersPanel from './FiltersPanel'
import { useCallback } from 'react'

interface Props {
  callback: () => void
  initialData: GrammarTopic[]
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

export default function GrammarTopicContent({ callback, initialData, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Khởi tạo và xác thực chặt chẽ các giá trị bộ lọc từ URL Params để đảm bảo tính nhất quán dữ liệu
  const rawSortBy = searchParams.get('sortBy')
  const rawSortOrder = searchParams.get('sortOrder')
  const rawIsActive = searchParams.get('isActive')

  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = [5, 10, 20, 50].includes(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 10
  const urlSearch = searchParams.get('search') || ""
  const urlIsActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined
  const urlSortBy = ['orderIndex', 'title', 'createdAt', 'updatedAt'].includes(rawSortBy || '') ? (rawSortBy as 'orderIndex' | 'title' | 'createdAt' | 'updatedAt') : 'orderIndex'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as 'asc' | 'desc') : 'asc'

  const [topics, setTopics] = useState<GrammarTopic[]>(initialData)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState<GrammarTopic[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
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

  const debouncedSearch = useDebounce(search, 500)

  // Cập nhật state khi prop initialData thay đổi (do Server Component fetch lại)
  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setTopics(initialData)
    setPrevInitialData(initialData)
  }

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
    if (newPage < 1 || (pages && newPage > pages)) return
    updateUrl({ page: newPage })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
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
        router.refresh()
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
        router.refresh()
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

        <DataTable
          columns={columnsGrammarTopic(callback, topics, handleSwapOrder)}
          data={topics}
          columnNameSearch="Tên chủ đề"
          serverSidePagination
          pagination={{ page: urlPage, limit: urlLimit, total, pages }}
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

