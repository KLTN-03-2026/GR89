'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState, useCallback } from 'react'
import { columnsIpa } from '../IpaTable/IpaColumn'
import { Ipa } from '@/features/IPA/types'
import { deleteManyIpa, getAllIPA, updateManyIpaStatus } from '@/features/IPA/services/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, RotateCcw, ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'
import DialogConfirmDeleteMutiple from '../dialogs/DialogConfirmDeleteMutiple'
import DialogConfirmPublishMutiple from '../dialogs/DialogConfirmPublishMutiple'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'


interface props {
  refresh: boolean
  callback: () => void
  initialData: Ipa[]
  initialPagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
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

export default function IpaContent({ refresh, callback, initialData, initialPagination }: props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Khởi tạo và xác thực chặt chẽ các giá trị bộ lọc từ URL Params để đảm bảo tính nhất quán dữ liệu
  const rawSoundType = searchParams.get('soundType')
  const rawSortBy = searchParams.get('sortBy')
  const rawSortOrder = searchParams.get('sortOrder')
  const rawIsActive = searchParams.get('isActive')

  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = [5, 10, 20, 50].includes(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 10
  const urlSearch = searchParams.get('search') || ""
  const urlSoundType = ['vowel', 'consonant', 'diphthong'].includes(rawSoundType || '') ? (rawSoundType as 'vowel' | 'consonant' | 'diphthong') : undefined
  const urlIsActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined
  const urlSortBy = ['sound', 'soundType', 'createdAt', 'updatedAt'].includes(rawSortBy || '') ? (rawSortBy as 'sound' | 'soundType' | 'createdAt' | 'updatedAt') : 'sound'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as 'asc' | 'desc') : 'asc'

  const [isLoading, setIsLoading] = useState(false)
  const [ipa, setIpa] = useState<Ipa[]>(initialData)
  const [total, setTotal] = useState(initialPagination.total)
  const [pages, setPages] = useState(initialPagination.pages)
  const [search, setSearch] = useState(urlSearch)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Ipa[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

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

  const fetchIpa = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getAllIPA({
        page: urlPage,
        limit: urlLimit,
        search: urlSearch,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        soundType: urlSoundType,
        isActive: urlIsActive
      })
      setIpa(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    } finally {
      setIsLoading(false)
    }
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlSoundType, urlIsActive])

  useEffect(() => {
    fetchIpa()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlSoundType, urlIsActive, refresh])

  useEffect(() => {
    let count = 0
    if (urlSearch) count++
    if (urlSoundType !== undefined) count++
    if (urlIsActive !== undefined) count++
    if (urlSortBy !== 'sound') count++
    if (urlSortOrder !== 'asc') count++
    setActiveFiltersCount(count)
  }, [urlSearch, urlSoundType, urlIsActive, urlSortBy, urlSortOrder])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) return
    updateUrl({ page: newPage })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleSoundTypeFilter = (value: string) => {
    updateUrl({ soundType: value === 'all' ? undefined : value, page: 1 })
  }

  const handleStatusFilter = (value: string) => {
    updateUrl({ isActive: value === 'all' ? undefined : value === 'active', page: 1 })
  }

  const handleSort = (field: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => {
    updateUrl({ sortBy: field, page: 1 })
  }

  const handleSortOrder = (order: 'asc' | 'desc') => {
    updateUrl({ sortOrder: order, page: 1 })
  }

  const handlePageSizeChange = (newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 })
  }

  const clearAllFilters = () => {
    setSearch("")
    router.push(pathname, { scroll: false })
  }

  const handleDeleteMultiple = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một IPA để xóa')
      return
    }
    const selected = ipa.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map(row => String(row._id))
      const res = await deleteManyIpa(ids)
      if (res.success) {
        toast.success(`Đã xóa ${res.data?.deletedCount || 0} IPA`)
        setSelectedRows([])
        setOpenDeleteDialog(false)
        callback()
        fetchIpa()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xóa IPA không thành công'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một IPA')
      return
    }
    const selected = ipa.filter(item => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một IPA')
      return
    }
    const selected = ipa.filter(item => ids.includes(String(item._id)))
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
      const res = await updateManyIpaStatus(ids, newIsActive)
      if (res.success) {
        toast.success(`Đã ${newIsActive ? 'xuất bản' : 'ẩn'} ${res.data?.updatedCount || 0} IPA`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        callback()
        fetchIpa()
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `${publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} thất bại`
      toast.error(errorMessage)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quản lý phiên âm IPA</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo âm hoặc mô tả..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Sound Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Loại âm</label>
                  <Select value={urlSoundType === undefined ? 'all' : urlSoundType} onValueChange={handleSoundTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="vowel">Nguyên âm</SelectItem>
                      <SelectItem value="consonant">Phụ âm</SelectItem>
                      <SelectItem value="diphthong">Nguyên âm đôi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                  <Select value={urlIsActive === undefined ? 'all' : urlIsActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đã xuất bản</SelectItem>
                      <SelectItem value="inactive">Chưa xuất bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                  <Select value={urlSortBy} onValueChange={(value: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => handleSort(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sound">Âm</SelectItem>
                      <SelectItem value="soundType">Loại âm</SelectItem>
                      <SelectItem value="createdAt">Ngày tạo</SelectItem>
                      <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Thứ tự</label>
                  <Select value={urlSortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Tăng dần</SelectItem>
                      <SelectItem value="desc">Giảm dần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số lượng/trang</label>
                  <Select value={urlLimit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
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
                  Hiển thị {ipa.length} trong {total} kết quả
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsIpa(callback, ipa)}
            data={ipa}
            isLoading={isLoading}
            columnNameSearch="Âm"
            serverSidePagination
            pagination={{
              page: urlPage,
              limit: urlLimit,
              total: total,
              pages: pages
            }}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onSelectedRowsChange={(rows) => setSelectedRows(rows as Ipa[])}
            handleDeleteMultiple={handleDeleteMultiple}
            handlePublishMultiple={handlePublishMany}
            handleUnpublishMultiple={handleUnpublishMany}
          />
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa nhiều */}
      <DialogConfirmDeleteMutiple
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        selectedRows={selectedRows.map(row => String(row._id))}
        setSelectedRows={(selectedRows: string[]) => setSelectedRows(selectedRows.map(id => ipa.find(row => String(row._id) === id) as Ipa))}
        isDeleting={isDeleting}
        confirmDeleteMultiple={confirmDeleteMultiple}
      />

      {/* Dialog xác nhận xuất bản/ẩn nhiều */}
      <DialogConfirmPublishMutiple
        open={openPublishDialog}
        setOpen={setOpenPublishDialog}
        selectedRows={selectedRows.map(row => String(row._id))}
        setSelectedRows={(selectedRows: string[]) => setSelectedRows(selectedRows.map(id => ipa.find(row => String(row._id) === id) as Ipa))}
        isPublishing={publishAction === 'publish'}
        confirmPublishMultiple={handlePublishManyConfirm}
        loadingAction={loadingAction}
      />
    </>
  )
}