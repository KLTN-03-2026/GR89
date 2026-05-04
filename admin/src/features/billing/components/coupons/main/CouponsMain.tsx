"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common"
import { columnsCoupons } from "../table/CouponsColumn"
import { Trash2, Eye, EyeOff, Ticket, CheckCircle2, AlertCircle, TrendingUp, Search, Filter } from "lucide-react"
import {
  getCouponsPaginated,
  deleteCoupon,
  deleteManyCoupons,
  updateManyCouponsStatus,
  Coupon,
  CouponQueryParams,
  getPlansPaginated,
  Plan
} from "@/lib/apis/api"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetAddCoupon } from "./SheetAddCoupon"
import { SheetUpdateCoupon } from "./SheetUpdateCoupon"
import { StatsGrid } from "@/components/common/shared/StatsGrid"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

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

interface CouponsMainProps {
  initialData: Coupon[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export function CouponsMain({ initialData, pagination: initialPagination }: CouponsMainProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>(initialData)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawIsActive = searchParams.get('isActive')
  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = Number(searchParams.get('limit')) || 10
  const urlSearch = searchParams.get('search') || ""
  const urlIsActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined
  const urlSortBy = searchParams.get('sortBy') || 'createdAt'
  const urlSortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  const [total, setTotal] = useState(initialPagination.total)
  const [pages, setPages] = useState(initialPagination.pages)
  const [search, setSearch] = useState(urlSearch)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedRows, setSelectedRows] = useState<Coupon[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const updateUrl = useCallback((updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
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

  const fetchCoupons = useCallback(async (params: CouponQueryParams) => {
    setIsLoading(true)
    try {
      const res = await getCouponsPaginated(params)
      setCoupons(res.data)
      setTotal(res.pagination.total)
      setPages(res.pagination.pages)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Luôn fetch khi URL thay đổi để đồng bộ dữ liệu
    fetchCoupons({
      page: urlPage,
      limit: urlLimit,
      search: urlSearch,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      isActive: urlIsActive,
    })
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive, fetchCoupons])

  // Fetch plans once so both Add and Edit sheets can use them.
  useEffect(() => {
    getPlansPaginated({ limit: 100 })
      .then(res => {  
        if (res.success) {
          setPlans(res.data || [])
        }
      })
      .catch(() => {
        toast.error('Không thể tải danh sách gói')
      })
  }, [])

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mã giảm giá')
      return
    }
    setLoadingAction(true)
    try {
      await deleteManyCoupons(selectedRows.map(r => r._id))
      toast.success(`Xóa thành công ${selectedRows.length} mã giảm giá`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      fetchCoupons(refreshParams())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể xóa mã giảm giá'
      toast.error(message)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mã giảm giá')
      return
    }
    setLoadingAction(true)
    try {
      await updateManyCouponsStatus(selectedRows.map(r => r._id), publishAction === 'publish')
      toast.success(`Cập nhật trạng thái thành công cho ${selectedRows.length} mã giảm giá`)
      setSelectedRows([])
      setOpenPublishDialog(false)
      fetchCoupons(refreshParams())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
      toast.error(message)
    } finally {
      setLoadingAction(false)
    }
  }

  const refreshParams = useCallback(() => ({
    page: urlPage,
    limit: urlLimit,
    search: urlSearch,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
    isActive: urlIsActive
  }), [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive])

  const handleEdit = useCallback((row: Coupon) => {
    setEditing(row)
    setOpen(true)
  }, [])

  const handleDelete = useCallback(async (row: Coupon) => {
    if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${row.code}"?`)) return
    try {
      await deleteCoupon(row._id)
      toast.success('Xóa mã giảm giá thành công')
      fetchCoupons(refreshParams())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể xóa mã giảm giá'
      toast.error(message)
    }
  }, [fetchCoupons, refreshParams])

  const cols = useMemo(
    () => columnsCoupons(handleEdit, handleDelete, () => fetchCoupons(refreshParams())),
    [handleEdit, handleDelete, fetchCoupons, refreshParams]
  )

  const kpiStats = useMemo(() => {
    const activeCount = coupons.filter(c => c.isActive).length
    const inactiveCount = coupons.length - activeCount
    return [
      {
        title: "Mã giảm giá",
        value: coupons.length.toString(),
        change: { value: "Tổng cộng", isPositive: true },
        icon: TrendingUp,
        tone: "rose" as const,
      },
      {
        title: "Đang hoạt động",
        value: activeCount,
        change: { value: "Đang hiệu lực", isPositive: true },
        icon: CheckCircle2,
        tone: "emerald" as const,
      },
      {
        title: "Đang lưu nháp",
        value: inactiveCount,
        change: { value: "Tạm dừng", isPositive: true },
        icon: AlertCircle,
        tone: "amber" as const,
      },
    ]
  }, [coupons])

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mã Giảm Giá</h1>
          </div>
          <p className="text-gray-500 font-medium">Quản lý các chương trình khuyến mãi và mã giảm giá.</p>
        </div>
        <div className="flex items-center gap-3">
          <SheetAddCoupon
            plans={plans}
            callback={() => fetchCoupons(refreshParams())}
          />
        </div>
      </div>

      <StatsGrid stats={kpiStats} columns={3} />

      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Filter className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Danh sách mã</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPublishAction('publish')
                    setOpenPublishDialog(true)
                  }}
                  className="h-9 px-4 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" /> Kích hoạt
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPublishAction('unpublish')
                    setOpenPublishDialog(true)
                  }}
                  className="h-9 px-4 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold"
                >
                  <EyeOff className="w-4 h-4 mr-2" /> Tạm tắt
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenDeleteDialog(true)}
                  className="h-9 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                </Button>
                <div className="h-4 w-1px bg-gray-200 mx-1" />
                <span className="text-xs font-black text-gray-400 px-3 uppercase tracking-tighter">Đã chọn {selectedRows.length}</span>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Tìm mã hoặc tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white w-250px transition-all font-medium"
              />
            </div>
            <Select value={urlIsActive === undefined ? "all" : urlIsActive ? "active" : "inactive"} onValueChange={(v) => updateUrl({ isActive: v === "all" ? undefined : v === "active", page: 1 })}>
              <SelectTrigger className="h-11 w-180px rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hiệu lực</SelectItem>
                <SelectItem value="inactive">Tạm tắt</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={urlSortBy}
              onValueChange={(v) => updateUrl({ sortBy: v, page: 1 })}
            >
              <SelectTrigger className="h-11 w-180px rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                <SelectItem value="code">Mã giảm giá</SelectItem>
                <SelectItem value="name">Tên chiến dịch</SelectItem>
                <SelectItem value="discountValue">Giá trị giảm</SelectItem>
                <SelectItem value="validFrom">Ngày bắt đầu</SelectItem>
                <SelectItem value="validTo">Ngày kết thúc</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={urlSortOrder}
              onValueChange={(v: 'asc' | 'desc') => updateUrl({ sortOrder: v, page: 1 })}
            >
              <SelectTrigger className="h-11 w-150px rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="desc">Mới nhất</SelectItem>
                <SelectItem value="asc">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={cols}
            data={coupons}
            columnNameSearch="code"
            isLoading={isLoading}
            serverSidePagination={true}
            pagination={{
              page: urlPage,
              pages,
              total,
              limit: urlLimit,
            }}
            onPageChange={(newPage) => updateUrl({ page: newPage })}
            onLimitChange={(newLimit) => updateUrl({ limit: newLimit, page: 1 })}
            onSelectedRowsChange={(rows) => setSelectedRows(rows)}
          />
        </CardContent>
      </Card>

      {editing && (
        <SheetUpdateCoupon
          open={open}
          setOpen={setOpen}
          coupon={editing}
          plans={plans}
          callback={() => fetchCoupons(refreshParams())}
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa {selectedRows.length} mã giảm giá đã chọn? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)} disabled={loadingAction}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={loadingAction}>
              {loadingAction ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{publishAction === 'publish' ? 'Kích hoạt' : 'Vô hiệu'} mã giảm giá</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn {publishAction === 'publish' ? 'kích hoạt' : 'vô hiệu'} {selectedRows.length} mã giảm giá đã chọn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPublishDialog(false)} disabled={loadingAction}>
              Hủy
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={loadingAction}>
              {loadingAction ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
