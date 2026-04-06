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
import { Search, Filter, X, RotateCcw, ChevronDown, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

export default function IpaContent({ refresh, callback }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [ipa, setIpa] = useState<Ipa[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState("")
  const [soundType, setSoundType] = useState<'vowel' | 'consonant' | 'diphthong' | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'sound' | 'soundType' | 'createdAt' | 'updatedAt'>('sound')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedRows, setSelectedRows] = useState<Ipa[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  const fetchIpa = useCallback(async (nextPage: number, nextSearch: string, nextLimit: number, nextSoundType: 'vowel' | 'consonant' | 'diphthong' | undefined, nextIsActive: boolean | undefined, nextSortBy: 'sound' | 'soundType' | 'createdAt' | 'updatedAt', nextSortOrder: 'asc' | 'desc') => {
    setIsLoading(true)
    await getAllIPA({
      page: nextPage,
      limit: nextLimit,
      search: nextSearch,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
      soundType: nextSoundType,
      isActive: nextIsActive
    }).then(res => {
      setIpa(res.data || [])
      setPage(res.pagination?.page || 1)
      setLimit(res.pagination?.limit || 10)
      setTotal(res.pagination?.total || 0)
      setPages(res.pagination?.pages || 0)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Effect for debounced search - only trigger when debounced search changes
  useEffect(() => {
    fetchIpa(1, debouncedSearch, limit, soundType, isActive, sortBy, sortOrder)
  }, [debouncedSearch, fetchIpa, isActive, limit, sortBy, sortOrder, soundType])

  useEffect(() => {
    if (debouncedSearch === search) {
      fetchIpa(1, search, limit, soundType, isActive, sortBy, sortOrder)
    }
  }, [limit, soundType, isActive, sortBy, sortOrder, fetchIpa, search, debouncedSearch])

  useEffect(() => {
    if (!refresh) return
    fetchIpa(1, search, limit, soundType, isActive, sortBy, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  useEffect(() => {
    fetchIpa(1, "", 10, undefined, undefined, 'sound', 'asc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let count = 0
    if (search) count++
    if (soundType !== undefined) count++
    if (isActive !== undefined) count++
    if (sortBy !== 'sound') count++
    if (sortOrder !== 'asc') count++
    setActiveFiltersCount(count)
  }, [search, soundType, isActive, sortBy, sortOrder])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pages && newPage > pages)) {
      return
    }
    setPage(newPage)
    fetchIpa(newPage, search, limit, soundType, isActive, sortBy, sortOrder)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Don't call fetchIpa here - let debounced effect handle it
  }

  const handleSoundTypeFilter = (value: string) => {
    const newSoundType = value === 'all' ? undefined : value as 'vowel' | 'consonant' | 'diphthong'
    setSoundType(newSoundType)
    setPage(1) // Reset to first page
    fetchIpa(1, search, limit, newSoundType, isActive, sortBy, sortOrder)
  }

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active'
    setIsActive(newIsActive)
    setPage(1) // Reset to first page
    fetchIpa(1, search, limit, soundType, newIsActive, sortBy, sortOrder)
  }

  const handleSort = (field: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page
    fetchIpa(1, search, limit, soundType, isActive, field, newSortOrder)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page
    fetchIpa(1, search, newLimit, soundType, isActive, sortBy, sortOrder)
  }

  const clearAllFilters = () => {
    setSearch("")
    setSoundType(undefined)
    setIsActive(undefined)
    setSortBy('sound')
    setSortOrder('asc')
    setPage(1)
    fetchIpa(1, "", limit, undefined, undefined, 'sound', 'asc')
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
        fetchIpa(page, search, limit, soundType, isActive, sortBy, sortOrder)
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
        fetchIpa(page, search, limit, soundType, isActive, sortBy, sortOrder)
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <Select value={soundType === undefined ? 'all' : soundType} onValueChange={handleSoundTypeFilter}>
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
                  <Select value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
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
                  <Select value={sortBy} onValueChange={(value: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => handleSort(value)}>
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
              page: page,
              limit: limit,
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
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều IPA</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> IPA đã chọn không?
              Hành động này sẽ xóa cả các ví dụ liên quan và không thể hoàn tác.
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
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} nhiều IPA</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> IPA đã chọn không?
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