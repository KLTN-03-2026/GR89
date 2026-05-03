"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common"
import { columnsPlans, PlanRow } from "../table/PlansColumn"
import { Eye, EyeOff, LayoutGrid, CheckCircle2, AlertCircle, TrendingUp, Search, Filter } from "lucide-react"
import {
  getPlansPaginated,
  updateManyPlansStatus,
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

interface PlansMainProps {
  initialData: PlanRow[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export function PlansMain({ initialData, pagination: initialPagination }: PlansMainProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanRow[]>(initialData)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = Number(searchParams.get('limit')) || 10
  const urlSearch = searchParams.get('search') || ""
  const urlIsActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
  const urlDisplayType = searchParams.get('displayType') || "all"
  const urlBillingCycle = searchParams.get('billingCycle') || "all"
  const urlSortBy = searchParams.get('sortBy') || "sortOrder"
  const urlSortOrder = (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  const [total, setTotal] = useState(initialPagination.total)
  const [pages, setPages] = useState(initialPagination.pages)
  const [search, setSearch] = useState(urlSearch)
  const [selectedRows, setSelectedRows] = useState<PlanRow[]>([])
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Debounce search input
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

  const fetchPlans = useCallback(async (params: PlanQueryParams) => {
    setIsLoading(true)
    try {
      const res = await getPlansPaginated(params)
      setPlans(res.data.map(p => ({ ...p, active: p.isActive })))
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
    // Luôn fetch khi URL thay đổi để đồng bộ dữ liệu
    fetchPlans({
      page: urlPage,
      limit: urlLimit,
      search: urlSearch,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      isActive: urlIsActive,
      displayType: urlDisplayType !== "all" ? urlDisplayType as any : undefined,
      billingCycle: urlBillingCycle !== "all" ? urlBillingCycle as any : undefined,
    })
  }, [urlPage, urlLimit, urlSearch, urlSortBy, urlSortOrder, urlIsActive, urlDisplayType, urlBillingCycle, fetchPlans, refreshKey])

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
            <Select value={urlIsActive === undefined ? "all" : urlIsActive ? "active" : "inactive"} onValueChange={(v) => updateUrl({ isActive: v === "all" ? undefined : v === "active", page: 1 })}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang bật</SelectItem>
                <SelectItem value="inactive">Tạm tắt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urlDisplayType} onValueChange={(v) => updateUrl({ displayType: v, page: 1 })}>
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
            <Select value={urlBillingCycle} onValueChange={(v) => updateUrl({ billingCycle: v, page: 1 })}>
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
