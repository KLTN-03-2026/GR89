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


export function UserMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [refresh, setRefresh] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState<'fullName' | 'email' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [openAdd, setOpenAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
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

      // Fetch inactive users count
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

  const fetchUsers = useCallback(async (pageNum: number = page, search: string = debouncedSearch, pageSize: number = limit, active?: boolean, role?: string, sortField?: string, sortDir?: string) => {
    setIsLoading(true)
    const params: UserQueryParams = {
      page: pageNum,
      limit: pageSize,
      search: search || undefined,
      isActive: active,
      role: role !== 'all' ? role : undefined,
      sortBy: sortField as 'fullName' | 'email' | 'createdAt',
      sortOrder: sortDir as 'asc' | 'desc'
    }

    await getAllUsersPaginated(params)
      .then(res => {
        setUsers(res.data || [])
        setPage(res.pagination?.page || pageNum)
        setLimit(res.pagination?.limit || pageSize)
        setTotal(res.pagination?.total || 0)
        setPages(res.pagination?.pages || 0)
        fetchStats()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [page, debouncedSearch, limit, fetchStats])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchUsers(page, debouncedSearch, limit, isActive, roleFilter, sortBy, sortOrder)
  }, [page, limit, isActive, roleFilter, sortBy, sortOrder, refresh, fetchUsers, debouncedSearch])

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active' ? true : false
    setIsActive(newIsActive)
    setPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field as 'fullName' | 'email' | 'createdAt')
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setIsActive(undefined)
    setSortBy('createdAt')
    setSortOrder('desc')
    setPage(1)
    setLimit(10)
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

      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
          <SheetHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-inner">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thêm Nhân Viên</SheetTitle>
                <SheetDescription className="text-gray-500 font-medium mt-1">
                  Chỉ tạo tài khoản với vai trò `&quot;`Quản lý nội dung`&quot;` (Content Manager).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Separator className="bg-gray-100" />

          <ScrollArea className="flex-1 min-h-0">
            <form
              id="form-add-user"
              className="p-8 space-y-8"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                const email = (formData.get('email') as string).trim()
                const fullName = (formData.get('fullname') as string).trim()
                const password = (formData.get('password') as string).trim()
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                if (!emailRegex.test(email)) {
                  toast.error('Email không hợp lệ')
                  form.querySelector<HTMLInputElement>('#email')?.focus()
                  return
                }

                setIsLoading(true)
                try {
                  const response = await createUser({ fullName, email, password, role: 'content' })
                  if (response.success) {
                    toast.success('Tạo tài khoản thành công')
                    setRefresh(!refresh)
                    setOpenAdd(false)
                    form.reset()
                  } else {
                    toast.error(response.message || 'Có lỗi xảy ra')
                  }
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-rose-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <Info className="w-4 h-4" />
                  Thông Tin Tài Khoản
                </div>

                <div className="grid gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1">Họ và Tên *</Label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="fullname" name="fullname" placeholder="Nguyễn Văn A" required className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold px-4 shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1">Email Đăng Nhập *</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="email" name="email" type="email" placeholder="user@example.com" required className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold px-4 shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1">Mật Khẩu Khởi Tạo *</Label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold px-4 shadow-sm" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <Shield className="w-4 h-4" />
                  Phân Quyền Hệ Thống
                </div>

                <div className="bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-900">Quản lý nội dung</p>
                    <p className="text-[11px] text-amber-700 font-bold opacity-70 uppercase tracking-tighter mt-0.5">Content Manager Role</p>
                  </div>
                  <div className="bg-amber-100 text-amber-700 p-2 rounded-xl shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </section>
            </form>
          </ScrollArea>

          <Separator className="bg-gray-100" />

          <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
            <div className="flex items-center justify-end gap-4 w-full">
              <Button variant="outline" onClick={() => setOpenAdd(false)} className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 active:scale-95 transition-all">
                Hủy Bỏ
              </Button>
              <Button type="submit" form="form-add-user" disabled={isLoading} className="h-12 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 font-black active:scale-95 transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tạo Tài Khoản'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
                {(isActive !== undefined || roleFilter !== 'all') && (
                  <Badge className="ml-2 bg-rose-600">{[isActive !== undefined, roleFilter !== 'all'].filter(Boolean).length}</Badge>
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
                <Select value={roleFilter} onValueChange={handleRoleFilter}>
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
                <Select value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
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
                <Select value={sortBy} onValueChange={(value) => handleSort(value)}>
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
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
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
              <Select value={limit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
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
              page: page || 1,
              limit: limit || 10,
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
