'use client'
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/common"
import { columnsUserScores } from "../../table/user-scores/UserScoresColumn"
import { PageHeader } from "@/components/common"
import { Search, TrendingUp, Users, Award, Clock, Filter, X } from "lucide-react"
import {
  getAllUserScoresPaginated,
  getUserScoresStats,
  getTopUsers,
  getSkillAnalysis,
  type UserScoreQueryParams,
} from "@/features/user/services/api"
import { UserScore, UserScoreStats, TopUser, SkillAnalysis } from "@/features/user/types"
import { toast } from "react-toastify"
import { UserScoresSkeleton } from "@/components/common/Skeletons/UserScoresSkeleton"
import { formatScore } from "@/lib/scoreUtils"
import { useDebounce } from "@/hooks/useDebounce"
import { Label } from "@/components/ui/label"



export function UserScoresMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [userScores, setUserScores] = useState<UserScore[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFilters, setShowFilters] = useState(false)

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)

  // Filter states
  const [sortBy, setSortBy] = useState<'totalPoints' | 'fullName' | 'email' | 'createdAt'>('totalPoints')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)

  const [stats, setStats] = useState<UserScoreStats>({
    totalUsers: 0,
    activeUsers: 0,
    averagePoints: 0,
    totalStudyTime: 0
  })
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis[]>([])

  const fetchUserScores = useCallback(async (pageNum: number = page, search: string = debouncedSearch, pageSize: number = limit, active?: boolean, sortField?: string, sortDir?: string) => {
    setIsLoading(true)
    try {
      const params: UserScoreQueryParams = {
        page: pageNum,
        limit: pageSize,
        search: search || undefined,
        isActive: active,
        sortBy: sortField as 'totalPoints' | 'fullName' | 'email' | 'createdAt',
        sortOrder: sortDir as 'asc' | 'desc'
      }

      const response = await getAllUserScoresPaginated(params)

      if (response.success) {
        setUserScores(response.data || [])
        setPage(response.pagination?.page || pageNum)
        setLimit(response.pagination?.limit || pageSize)
        setTotal(response.pagination?.total || 0)
        setPages(response.pagination?.pages || 0)
      } else {
        toast.error('Không thể tải danh sách điểm số')
        setUserScores([])
        setTotal(0)
        setPages(0)
      }
    } catch (error: unknown) {
      console.error('Error fetching user scores:', error)
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu'
        : 'Có lỗi xảy ra khi tải dữ liệu'
      toast.error(errorMessage)
      setUserScores([])
      setTotal(0)
      setPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch, limit])

  const fetchStats = useCallback(async () => {
    try {
      // Fetch stats
      const statsResponse = await getUserScoresStats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Fetch top users
      const topUsersResponse = await getTopUsers(5)
      if (topUsersResponse.success && topUsersResponse.data) {
        setTopUsers(topUsersResponse.data)
      }

      // Fetch skill analysis
      const skillResponse = await getSkillAnalysis()
      if (skillResponse.success && skillResponse.data) {
        setSkillAnalysis(skillResponse.data)
      }
    } catch (error: unknown) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  // Effect for debounced search - reset to page 1
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Single effect for all changes
  useEffect(() => {
    fetchUserScores(page, debouncedSearch, limit, isActive, sortBy, sortOrder)
  }, [page, limit, isActive, sortBy, sortOrder, fetchUserScores, debouncedSearch])

  // Effect for stats (only fetch once)
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Handler functions
  const handleStatusFilter = (value: string) => {
    const newIsActive = value === 'all' ? undefined : value === 'active' ? true : false
    setIsActive(newIsActive)
    setPage(1) // Reset to first page when filtering
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field as 'totalPoints' | 'fullName' | 'email' | 'createdAt')
      setSortOrder('desc')
    }
    setPage(1) // Reset to first page when sorting
  }

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing page size
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setIsActive(undefined)
    setSortBy('totalPoints')
    setSortOrder('desc')
    setPage(1)
    setLimit(10)
  }

  // Use API stats (backend now calculates activeUsers correctly based on recent activity)
  const displayStats = {
    totalUsers: stats.totalUsers || total,
    activeUsers: stats.activeUsers || 0, // Use backend calculation
    averagePoints: stats.averagePoints || (userScores.length > 0 ? Math.round(userScores.reduce((sum, u) => sum + u.totalPoints, 0) / userScores.length) : 0),
    totalStudyTime: stats.totalStudyTime || userScores.reduce((sum, u) => sum + u.totalStudyTime, 0)
  }


  if (isLoading) {
    return <UserScoresSkeleton />
  }

  return (
    <>
      <PageHeader
        title="Quản lý điểm người dùng"
        subtitle="Theo dõi và quản lý điểm số, tiến độ học tập của người dùng"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
                <p className="text-2xl font-bold">{displayStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Điểm trung bình</p>
                <p className="text-2xl font-bold">{displayStats.averagePoints}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng thời gian học</p>
                <p className="text-2xl font-bold">{displayStats.totalStudyTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người dùng hoạt động</p>
                <p className="text-2xl font-bold">{displayStats.activeUsers}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                  {(isActive !== undefined) && (
                    <Badge variant="secondary" className="ml-1">
                      {[isActive !== undefined].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <Select value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Tạm khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sắp xếp theo</Label>
                  <Select value={sortBy} onValueChange={(value) => handleSort(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trường sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="totalPoints">Tổng điểm</SelectItem>
                      <SelectItem value="fullName">Tên</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Thứ tự</Label>
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thứ tự" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Tăng dần</SelectItem>
                      <SelectItem value="desc">Giảm dần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Page Size and Info */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Hiển thị:</Label>
                <Select value={limit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">/trang</span>
              </div>

              <div className="text-sm text-muted-foreground">
                Hiển thị {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} trong {total} kết quả
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="detailed">Chi tiết</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent>
              <DataTable
                columns={columnsUserScores()}
                data={userScores}
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
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4">
            {userScores.map((user) => (
              <Card key={user._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{user.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatScore(user.totalPoints)} điểm
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">

                    {/* Skills Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Từ vựng</span>
                          <span className="text-sm font-medium">{formatScore(user.vocabularyPoints)}</span>
                        </div>
                        <Progress value={(user.vocabularyPoints / 400) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Ngữ pháp</span>
                          <span className="text-sm font-medium">{formatScore(user.grammarPoints)}</span>
                        </div>
                        <Progress value={(user.grammarPoints / 400) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Đọc hiểu</span>
                          <span className="text-sm font-medium">{formatScore(user.readingPoints)}</span>
                        </div>
                        <Progress value={(user.readingPoints / 400) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Nghe hiểu</span>
                          <span className="text-sm font-medium">{formatScore(user.listeningPoints)}</span>
                        </div>
                        <Progress value={(user.listeningPoints / 400) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Nói</span>
                          <span className="text-sm font-medium">{formatScore(user.speakingPoints)}</span>
                        </div>
                        <Progress value={(user.speakingPoints / 400) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Viết</span>
                          <span className="text-sm font-medium">{formatScore(user.writingPoints)}</span>
                        </div>
                        <Progress value={(user.writingPoints / 400) * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Chuỗi hiện tại</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Chuỗi dài nhất</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.totalStudyTime}h</div>
                        <div className="text-xs text-muted-foreground">Thời gian học</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top người dùng theo điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topUsers.length > 0 ? topUsers : userScores
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 5))
                    .map((user, index) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">{user.currentLevel}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{formatScore(user.totalPoints)} điểm</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân tích kỹ năng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(skillAnalysis.length > 0 ? skillAnalysis : [
                    { name: 'Từ vựng', avg: Math.round(userScores.reduce((sum, u) => sum + u.vocabularyPoints, 0) / userScores.length) },
                    { name: 'Ngữ pháp', avg: Math.round(userScores.reduce((sum, u) => sum + u.grammarPoints, 0) / userScores.length) },
                    { name: 'Đọc hiểu', avg: Math.round(userScores.reduce((sum, u) => sum + u.readingPoints, 0) / userScores.length) },
                    { name: 'Nghe hiểu', avg: Math.round(userScores.reduce((sum, u) => sum + u.listeningPoints, 0) / userScores.length) },
                    { name: 'Nói', avg: Math.round(userScores.reduce((sum, u) => sum + u.speakingPoints, 0) / userScores.length) },
                    { name: 'Viết', avg: Math.round(userScores.reduce((sum, u) => sum + u.writingPoints, 0) / userScores.length) }
                  ]).map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{skill.name}</span>
                        <span className="text-sm font-medium">{skill.avg}</span>
                      </div>
                      <Progress value={(skill.avg / 400) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
