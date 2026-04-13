"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common"
import { columnsPlans, PlanRow } from "../table/PlansColumn"
import { Download, Upload, Eye, EyeOff, LayoutGrid, CheckCircle2, AlertCircle, TrendingUp, Search, Filter } from "lucide-react"
import {
  getPlansPaginated,
  updateManyPlansStatus,
  exportPlanExcel,
  importPlanExcel,
  PlanQueryParams
} from "@/lib/apis/api"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetAddPlan } from "@/features/billing/components/dialogs/SheetAddPlan"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatsGrid } from "@/components/common/shared/StatsGrid"

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

export function PlansMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [displayType, setDisplayType] = useState<"default" | "vip" | "premium" | "all">("all")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "lifetime" | "all">("all")
  const [sortBy] = useState<string>("sortOrder")
  const [sortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<PlanRow[]>([])
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  const fetchPlans = useCallback(async (params: PlanQueryParams) => {
    setIsLoading(true)
    try {
      const res = await getPlansPaginated(params)
      setPlans(res.data.map(p => ({ ...p, active: p.isActive })))
      setPage(res.pagination.page)
      setLimit(res.pagination.limit)
      setTotal(res.pagination.total)
      setPages(res.pagination.pages)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách gói')
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const params: PlanQueryParams = {
      page,
      limit,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      isActive: isActive,
      displayType: displayType !== "all" ? displayType : undefined,
      billingCycle: billingCycle !== "all" ? billingCycle : undefined,
    }
    fetchPlans(params)
  }, [page, limit, debouncedSearch, sortBy, sortOrder, isActive, displayType, billingCycle, fetchPlans, refreshKey])

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleBulkStatusUpdate = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một gói')
      return
    }

    setLoadingAction(true)
    try {
      await updateManyPlansStatus(selectedRows.map(r => r._id), publishAction === 'publish')
      toast.success(`Cập nhật trạng thái thành công cho ${selectedRows.length} gói`)
      setSelectedRows([])
      setOpenPublishDialog(false)
      setRefreshKey(prev => prev + 1)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportPlanExcel()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plans_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Xuất Excel thành công')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể xuất Excel')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const result = await importPlanExcel(file, false)
      toast.success(`Import thành công: ${result.data?.created} tạo mới, ${result.data?.updated} cập nhật`)
      setRefreshKey(prev => prev + 1)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể import Excel')
    }
  }

  const cols = useMemo(() => columnsPlans(handleRefresh), [handleRefresh])

  const kpiStats = useMemo(() => {
    const activeCount = plans.filter(p => p.isActive).length
    const inactiveCount = plans.length - activeCount
    return [
      {
        title: "Gói dịch vụ",
        value: total,
        change: { value: "Tổng cộng", isPositive: true },
        icon: TrendingUp,
        tone: "blue" as const,
      },
      {
        title: "Đã xuất bản",
        value: activeCount,
        change: { value: "Đang hoạt động", isPositive: true },
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
  }, [plans, total])

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gói Nâng Cấp</h1>
          </div>
          <p className="text-gray-500 font-medium">Quản lý các gói dịch vụ và quyền lợi người dùng.</p>
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
          <SheetAddPlan callback={handleRefresh} />
        </div>
      </div>

      <StatsGrid stats={kpiStats} columns={3} />

      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Filter className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Danh sách gói</CardTitle>
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
                  <Eye className="w-4 h-4 mr-2" /> Xuất bản
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
                  <EyeOff className="w-4 h-4 mr-2" /> Ẩn
                </Button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <span className="text-xs font-black text-gray-400 px-3 uppercase tracking-tighter">Đã chọn {selectedRows.length}</span>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Tìm tên gói..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white w-[250px] transition-all font-medium"
              />
            </div>
            <Select value={isActive === undefined ? "all" : isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "all" ? undefined : v === "active")}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang bật</SelectItem>
                <SelectItem value="inactive">Tạm tắt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={displayType} onValueChange={(v: "all" | "default" | "vip" | "premium") => setDisplayType(v)}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Loại hiển thị" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={billingCycle} onValueChange={(v: "all" | "monthly" | "yearly" | "lifetime") => setBillingCycle(v)}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Chu kỳ" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả chu kỳ</SelectItem>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
                <SelectItem value="yearly">Hàng năm</SelectItem>
                <SelectItem value="lifetime">Trọn đời</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={cols}
            data={plans}
            columnNameSearch="name"
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

      {/* Publish Dialog */}
      <Dialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{publishAction === 'publish' ? 'Xuất bản' : 'Ẩn'} gói</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn {publishAction === 'publish' ? 'xuất bản' : 'ẩn'} {selectedRows.length} gói đã chọn?
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
