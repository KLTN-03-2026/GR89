"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common"
import { columnsCoupons } from "../table/CouponsColumn"
import { Plus, Download, Upload, Trash2, Eye, EyeOff, Ticket, CheckCircle2, AlertCircle, TrendingUp, Search, Filter } from "lucide-react"
import {
  getCouponsPaginated,
  deleteCoupon,
  deleteManyCoupons,
  updateManyCouponsStatus,
  exportCouponExcel,
  importCouponExcel,
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

export function CouponsMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedRows, setSelectedRows] = useState<Coupon[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const fetchCoupons = useCallback(async (params: CouponQueryParams) => {
    setIsLoading(true)
    await getCouponsPaginated(params)
      .then(res => {
        setCoupons(res.data)
        setPage(res.pagination.page)
        setLimit(res.pagination.limit)
        setTotal(res.pagination.total)
        setPages(res.pagination.pages)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const params: CouponQueryParams = {
      page,
      limit,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      isActive: isActive,
    }
    fetchCoupons(params)
  }, [page, limit, debouncedSearch, sortBy, sortOrder, isActive, fetchCoupons])

  // Fetch plans when dialog opens
  useEffect(() => {
    if (open) {
      getPlansPaginated({ limit: 100 })
        .then(res => {
          setPlans(res.data || [])
        })
        .catch(() => {
          toast.error('Không thể tải danh sách gói')
        })
    }
  }, [open])

  const handleEdit = (row: Coupon) => {
    setEditing(row)
    setOpen(true)
  }

  const handleDelete = async (row: Coupon) => {
    if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${row.code}"?`)) return
    try {
      await deleteCoupon(row._id)
      toast.success('Xóa mã giảm giá thành công')
      fetchCoupons(refreshParams())
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa mã giảm giá')
    }
  }

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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa mã giảm giá')
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportCouponExcel()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coupons_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Xuất Excel thành công')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xuất Excel')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const result = await importCouponExcel(file, false)
      toast.success(`Import thành công: ${result.data?.created} tạo mới, ${result.data?.updated} cập nhật`)
      fetchCoupons(refreshParams())
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể import Excel')
    }
  }

  const refreshParams = useCallback(() => ({
    page,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    isActive
  }), [page, limit, debouncedSearch, sortBy, sortOrder, isActive])

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
        value: total,
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
  }, [coupons, total])

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
          <Button variant="outline" onClick={handleExport} className="h-12 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all font-bold">
            <Download className="w-4 h-4 mr-2 text-gray-400" />
            Xuất Excel
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild className="h-12 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all font-bold">
              <span><Upload className="w-4 h-4 mr-2 text-gray-400" /> Nhập Excel</span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
            />
          </label>
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
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <span className="text-xs font-black text-gray-400 px-3 uppercase tracking-tighter">Đã chọn {selectedRows.length}</span>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Tìm mã hoặc tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white w-[250px] transition-all font-medium"
              />
            </div>
            <Select value={isActive === undefined ? "all" : isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "all" ? undefined : v === "active")}>
              <SelectTrigger className="h-11 w-[180px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hiệu lực</SelectItem>
                <SelectItem value="inactive">Tạm tắt</SelectItem>
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
              page,
              pages,
              total,
              limit,
            }}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit)
              setPage(1)
            }}
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
