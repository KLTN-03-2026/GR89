'use client'
import { DataTable } from "@/components/common"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState, useCallback } from "react"
import { columnsUser } from "../../table/user/UserColumn"
import { User } from "@/features/user/types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Users, Filter, X, UserPlus, Mail, Key, Shield, Info, CheckCircle2, UserCheck, UserMinus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAllUsersPaginated, createUser, type UserQueryParams } from "@/features/user/services/api"
import { toast } from "react-toastify"
import { UserManagementSkeleton } from "@/components/common/Skeletons/UserManagementSkeleton"
import { useDebounce } from "@/hooks/useDebounce"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { StatsGrid } from "@/components/common/shared/StatsGrid"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import SheetAddUser from "../../dialog/SheetAddUser"

export function UserMain() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawSortBy = searchParams.get('sortBy')
  const rawSortOrder = searchParams.get('sortOrder')
  const rawIsActive = searchParams.get('isActive')
  const rawRoleFilter = searchParams.get('roleFilter')

  const urlPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const urlLimit = [5, 10, 20, 50].includes(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 10
  const urlSearch = searchParams.get('search') || ""
  const urlIsActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined
  const urlSortBy = ['fullName', 'email', 'createdAt'].includes(rawSortBy || '') ? (rawSortBy as 'fullName' | 'email' | 'createdAt') : 'createdAt'
  const urlSortOrder = ['asc', 'desc'].includes(rawSortOrder || '') ? (rawSortOrder as 'asc' | 'desc') : 'desc'
  const urlRoleFilter = ['all', 'user', 'content'].includes(rawRoleFilter || '') ? rawRoleFilter || 'all' : 'all'

  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [refresh, setRefresh] = useState(false)
  const [searchTerm, setSearchTerm] = useState(urlSearch)
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [openAdd, setOpenAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Pagination states
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)

  // Stats states
  const [totalActive, setTotalActive] = useState(0)
  const [totalInactive, setTotalInactive] = useState(0)

  const fetchStats = useCallback(async () => {
    try {
      const activeResponse = await getAllUsersPaginated({
        page: 1,
        limit: 1,
        isActive: true
      })

      const inactiveResponse = await getAllUsersPaginated({
        page: 1,
        limit: 1,
        isActive: false
      })

      if (activeResponse.success && inactiveResponse.success) {
        setTotalActive(activeResponse.pagination?.total || 0)
        setTotalInactive(inactiveResponse.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    if (urlSearch !== debouncedSearch) {
      setSearchTerm(urlSearch)
    }
  }, [urlSearch, debouncedSearch])

  const updateUrl = useCallback((updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || (key === 'roleFilter' && value === 'all')) {
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    const params: UserQueryParams = {
      page: urlPage,
      limit: urlLimit,
      search: urlSearch || undefined,
      isActive: urlIsActive,
      role: urlRoleFilter !== 'all' ? urlRoleFilter : undefined,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder
    }

    await getAllUsersPaginated(params)
      .then(res => {
        setUsers(res.data || [])
        setTotal(res.pagination?.total || 0)
        setPages(res.pagination?.pages || 0)
        fetchStats()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [urlPage, urlSearch, urlLimit, urlIsActive, urlRoleFilter, urlSortBy, urlSortOrder, fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refresh])

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active' ? true : false
    updateUrl({ isActive: newIsActive, page: 1 })
  }

  const handleRoleFilter = (value: string) => {
    updateUrl({ roleFilter: value, page: 1 })
  }

  const handleSort = (field: string) => {
    updateUrl({ sortBy: field, page: 1 })
  }

  const handlePageSizeChange = (newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage })
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    router.push(pathname, { scroll: false })
  }

  const kpiStats = [
    {
      title: "Tổng người dùng",
      value: totalActive + totalInactive,
      change: { value: "Hệ thống", isPositive: true },
      icon: Users,
      tone: "rose" as const,
    },
    {
      title: "Đang hoạt động",
      value: totalActive,
      change: { value: "Online/Active", isPositive: true },
      icon: UserCheck,
      tone: "emerald" as const,
    },
    {
      title: "Tài khoản khóa",
      value: totalInactive,
      change: { value: "Bị vô hiệu", isPositive: false },
      icon: UserMinus,
      tone: "amber" as const,
    },
  ]

  if (isLoading) {
    return <UserManagementSkeleton />
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Người Dùng</h1>
          </div>
          <p className="text-gray-500 font-medium">Quản lý tài khoản, thông tin và phân quyền người dùng.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all font-bold">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm Quản Lý Nội Dung
        </Button>
      </div>

      <StatsGrid stats={kpiStats} columns={3} />

      <SheetAddUser
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        callback={fetchUsers}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Filters Card */}
      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-2xl focus:bg-white transition-all font-medium"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-6 rounded-2xl border-gray-200 font-bold transition-all ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
                {(urlIsActive !== undefined || urlRoleFilter !== 'all') && (
                  <Badge className="ml-2 bg-rose-600">{[urlIsActive !== undefined, urlRoleFilter !== 'all'].filter(Boolean).length}</Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-12 px-6 rounded-2xl text-gray-400 hover:text-rose-600 font-bold"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa lọc
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-2.5">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Vai trò</Label>
                <Select value={urlRoleFilter} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 border-gray-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="user">Học viên</SelectItem>
                    <SelectItem value="content">Quản lý nội dung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Trạng thái</Label>
                <Select value={urlIsActive === undefined ? 'all' : urlIsActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 border-gray-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Sắp xếp</Label>
                <Select value={urlSortBy} onValueChange={(value) => handleSort(value)}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 border-gray-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="fullName">Tên người dùng</SelectItem>
                    <SelectItem value="email">Địa chỉ Email</SelectItem>
                    <SelectItem value="createdAt">Ngày tham gia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Thứ tự</Label>
                <Select value={urlSortOrder} onValueChange={(value) => updateUrl({ sortOrder: value, page: 1 })}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 border-gray-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="asc">Tăng dần (A-Z)</SelectItem>
                    <SelectItem value="desc">Giảm dần (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-gray-400 uppercase tracking-tighter">Hiển thị</span>
              <Select value={urlLimit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20 h-9 rounded-lg bg-gray-50 border-gray-200 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm font-bold text-gray-400">người dùng / trang</span>
            </div>
            <div className="text-sm font-black text-rose-600/50 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full">
              {total} kết quả tìm thấy
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columnsUser()}
            data={users}
            isLoading={isLoading}
            serverSidePagination={true}
            pagination={{
              page: urlPage,
              limit: urlLimit,
              total: total || 0,
              pages: pages || 0
            }}
            onPageChange={handlePageChange}
            onSearch={(search) => setSearchTerm(search)}
            columnNameSearch="searchable"
            initialColumnVisibility={{ searchable: false }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
