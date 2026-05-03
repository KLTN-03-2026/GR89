'use client'
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common"
import {
  getAllUserScoresPaginated,
  getUserScoresStats,
  getTopUsers,
  getSkillAnalysis,
  type UserScoreQueryParams,
} from "@/features/user/services/api"
import { UserScore, UserScoreStats, TopUser, SkillAnalysis } from "@/features/user/types"
import { UserScoresSkeleton } from "@/components/common/Skeletons/UserScoresSkeleton"
import { useDebounce } from "@/hooks/useDebounce"
import { UserScoresStatsCards } from "./UserScoresStatsCards"
import { UserScoresFilters } from "./UserScoresFilters"
import { UserScoresOverviewTab } from "./UserScoresOverviewTab"
import { UserScoresDetailedTab } from "./UserScoresDetailedTab"
import { UserScoresAnalyticsTab } from "./UserScoresAnalyticsTab"

export function UserScoresMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [userScores, setUserScores] = useState<UserScore[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFilters, setShowFilters] = useState(false)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)

  const [sortBy, setSortBy] = useState<"totalPoints" | "fullName" | "email" | "createdAt">("totalPoints")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)

  const [stats, setStats] = useState<UserScoreStats>({
    totalUsers: 0,
    activeUsers: 0,
    averagePoints: 0,
    totalStudyTime: 0,
  })
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis[]>([])

  const fetchUserScores = useCallback(
    async (
      pageNum: number = page,
      search: string = debouncedSearch,
      pageSize: number = limit,
      active?: boolean,
      sortField?: string,
      sortDir?: string
    ) => {
      setIsLoading(true)
      const params: UserScoreQueryParams = {
        page: pageNum,
        limit: pageSize,
        search: search || undefined,
        isActive: active,
        sortBy: sortField as "totalPoints" | "fullName" | "email" | "createdAt",
        sortOrder: sortDir as "asc" | "desc",
      }

      await getAllUserScoresPaginated(params)
        .then((res) => {
          setUserScores(res.data || [])
          setPage(res.pagination?.page || pageNum)
          setLimit(res.pagination?.limit || pageSize)
          setTotal(res.pagination?.total || 0)
          setPages(res.pagination?.pages || 0)
        })
        .finally(() => {
          setIsLoading(false)
        })
    },
    [page, debouncedSearch, limit]
  )

  const fetchStats = useCallback(async () => {
    await getUserScoresStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data)
        }
      })

    await getTopUsers(5)
      .then(res => {
        if (res.success && res.data) {
          setTopUsers(res.data)
        }
      })


    await getSkillAnalysis()
      .then(res => {
        if (res.success && res.data) {
          setSkillAnalysis(res.data)
        }
      })
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchUserScores(page, debouncedSearch, limit, isActive, sortBy, sortOrder)
  }, [page, limit, isActive, sortBy, sortOrder, fetchUserScores, debouncedSearch])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleStatusFilter = (value: string) => {
    const newIsActive = value === "all" ? undefined : value === "active"
    setIsActive(newIsActive)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field as "totalPoints" | "fullName" | "email" | "createdAt")
      setSortOrder("desc")
    }
    setPage(1)
  }

  const handlePageSizeChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [setLimit, setPage])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setIsActive(undefined)
    setSortBy("totalPoints")
    setSortOrder("desc")
    setPage(1)
    setLimit(10)
  }

  const displayStats = {
    totalUsers: stats.totalUsers || total,
    activeUsers: stats.activeUsers || 0,
    averagePoints: stats.averagePoints || (userScores.length > 0 ? Math.round(userScores.reduce((sum, u) => sum + u.totalPoints, 0) / userScores.length) : 0),
    totalStudyTime: stats.totalStudyTime || userScores.reduce((sum, u) => sum + u.totalStudyTime, 0),
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

      <UserScoresStatsCards
        totalUsers={displayStats.totalUsers}
        averagePoints={displayStats.averagePoints}
        totalStudyTime={displayStats.totalStudyTime}
        activeUsers={displayStats.activeUsers}
      />

      <UserScoresFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isActive={isActive}
        handleStatusFilter={handleStatusFilter}
        sortBy={sortBy}
        handleSort={handleSort}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        limit={limit}
        handlePageSizeChange={handlePageSizeChange}
        page={page}
        total={total}
        clearAllFilters={clearAllFilters}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="detailed">Chi tiết</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UserScoresOverviewTab
            userScores={userScores}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={total}
            pages={pages}
            handlePageChange={handlePageChange}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <UserScoresDetailedTab userScores={userScores} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <UserScoresAnalyticsTab
            topUsers={topUsers}
            userScores={userScores}
            skillAnalysis={skillAnalysis}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
