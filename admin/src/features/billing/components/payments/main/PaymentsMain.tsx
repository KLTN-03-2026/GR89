"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/common"
import { columnsPayments, PaymentRow } from "../table/PaymentsColumn"
import { Download, CheckCircle2, Search, Filter, CreditCard, Banknote, Wallet } from "lucide-react"
import {
  getPaymentsPaginated,
  PaymentQueryParams
} from "@/lib/apis/api"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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

export function PaymentsMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [paidCount, setPaidCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [provider, setProvider] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(search, 500)

  const fetchPayments = useCallback(async (params: PaymentQueryParams) => {
    setIsLoading(true)
    await getPaymentsPaginated(params)
      .then(res => {
        setPayments(res.data.map(p => ({
          ...p,
          id: p._id,
          user: typeof p.userId === 'object' ? p.userId.fullName : String(p.userId)
        })))
        setPage(res.pagination.page)
        setLimit(res.pagination.limit)
        setTotal(res.pagination.total)
        setPages(res.pagination.pages)
        setPaidCount(res.paidCount)
        setTotalRevenue(res.totalRevenue)
      }).finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const params: PaymentQueryParams = {
      page,
      limit,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      status: status !== "all" ? status as "pending" | "paid" | "failed" | "refunded" | "cancelled" : undefined,
      provider: provider !== "all" ? provider as "vnpay" | "momo" | "stripe" | "paypal" : undefined,
    }
    fetchPayments(params)
  }, [page, limit, debouncedSearch, sortBy, sortOrder, status, provider, fetchPayments])

  const formatVnd = useCallback((value: number) => {
    const rounded = Math.round(value || 0)
    return `${rounded.toLocaleString('vi-VN')} ₫`
  }, [])

  const kpiStats = useMemo(() => {
    return [
      {
        title: "Tổng doanh thu",
        value: formatVnd(totalRevenue),
        change: { value: "Doanh thu", isPositive: true },
        icon: Banknote,
        tone: "emerald" as const,
      },
      {
        title: "Tổng số lượt thanh toán",
        value: total,
        change: { value: "Giao dịch", isPositive: true },
        icon: CheckCircle2,
        tone: "blue" as const,
      },
      {
        title: "Đơn hàng hoàn tất",
        value: paidCount,
        change: { value: "Thành công", isPositive: true },
        icon: Wallet,
        tone: "indigo" as const,
      },
    ]
  }, [total, paidCount, totalRevenue, formatVnd])

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Giao Dịch</h1>
          </div>
          <p className="text-gray-500 font-medium">Theo dõi lịch sử thanh toán và doanh thu hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all font-bold">
            <Download className="w-4 h-4 mr-2 text-gray-400" />
            Báo cáo tài chính
          </Button>
        </div>
      </div>

      <StatsGrid stats={kpiStats} columns={3} />

      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Filter className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Lịch sử thanh toán</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Mã giao dịch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white w-[200px] transition-all font-medium"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Cổng thanh toán" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="all">Tất cả cổng</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
                <SelectItem value="momo">MoMo</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value)
              setPage(1)
            }}>
              <SelectTrigger className="h-11 w-[170px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="paymentDate">Ngày thanh toán</SelectItem>
                <SelectItem value="amount">Số tiền</SelectItem>
                <SelectItem value="status">Trạng thái</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => {
              setSortOrder(value as 'asc' | 'desc')
              setPage(1)
            }}>
              <SelectTrigger className="h-11 w-[150px] rounded-xl border-gray-200 bg-gray-50/50 font-bold text-gray-600">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columnsPayments}
            data={payments}
            columnNameSearch="_id"
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
          />
        </CardContent>
      </Card>
    </div>
  )
}
