'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common"
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react"
import Link from "next/link"
import { getUserScoreById, getUserStudyHistory } from "@/features/user/services/api"
import { UserScore, UserStudyHistoryEntry } from "@/features/user/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UserDetailScoresMainProps {
  userId: string
}

const categoryHistoryLabels: Record<UserStudyHistoryEntry['category'], string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  ipa: 'Phiên âm IPA',
  listening: 'Nghe',
  speaking: 'Nói',
  reading: 'Đọc',
  writing: 'Viết',
}

function formatStudyDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m} phút ${s > 0 ? `${s}s` : ''}`.trim()
}

function statusHistoryLabel(status: UserStudyHistoryEntry['status']): string {
  if (status === 'passed') return 'Đạt'
  if (status === 'failed') return 'Chưa đạt'
  return 'Đang học'
}

export function UserDetailScoresMain({ userId }: UserDetailScoresMainProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [studyHistory, setStudyHistory] = useState<UserStudyHistoryEntry[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)
      setHistoryError(null)
      try {
        const [scoreOutcome, historyOutcome] = await Promise.allSettled([
          getUserScoreById(userId),
          getUserStudyHistory(userId, 100),
        ])
        if (scoreOutcome.status === 'fulfilled') {
          const scoreRes = scoreOutcome.value
          if (scoreRes.success && scoreRes.data) {
            setUserData(scoreRes.data)
          } else {
            setError("Không thể tải dữ liệu người dùng")
          }
        } else {
          console.error(scoreOutcome.reason)
          setError("Không thể tải dữ liệu người dùng")
        }
        if (historyOutcome.status === 'fulfilled') {
          const historyRes = historyOutcome.value
          if (historyRes.success && historyRes.data) {
            setStudyHistory(historyRes.data)
          } else {
            setHistoryError(historyRes.message || "Không tải được lịch sử học tập")
          }
        } else {
          console.error(historyOutcome.reason)
          setHistoryError("Không tải được lịch sử học tập")
        }
      } catch (err) {
        console.error("Error fetching user score:", err)
        setError("Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error || "Không tìm thấy dữ liệu người dùng"}</div>
      </div>
    )
  }

  // Calculate max points for each skill (you can adjust these values)
  const maxPointsPerSkill = 400
  const skills = {
    vocabulary: {
      points: userData.vocabularyPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.vocabularyPoints || 0) / maxPointsPerSkill) * 100, 100)
    },
    grammar: {
      points: userData.grammarPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.grammarPoints || 0) / maxPointsPerSkill) * 100, 100)
    },
    reading: {
      points: userData.readingPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.readingPoints || 0) / maxPointsPerSkill) * 100, 100)
    },
    listening: {
      points: userData.listeningPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.listeningPoints || 0) / maxPointsPerSkill) * 100, 100)
    },
    speaking: {
      points: userData.speakingPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.speakingPoints || 0) / maxPointsPerSkill) * 100, 100)
    },
    writing: {
      points: userData.writingPoints || 0,
      maxPoints: maxPointsPerSkill,
      progress: Math.min(((userData.writingPoints || 0) / maxPointsPerSkill) * 100, 100)
    }
  }

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-gray-500',
      'A2': 'bg-blue-500',
      'B1': 'bg-green-500',
      'B2': 'bg-yellow-500',
      'C1': 'bg-orange-500',
      'C2': 'bg-red-500'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-500'
  }

  const skillLabels = {
    'vocabulary': 'Từ vựng',
    'grammar': 'Ngữ pháp',
    'reading': 'Đọc hiểu',
    'listening': 'Nghe hiểu',
    'speaking': 'Nói',
    'writing': 'Viết'
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/user/scores">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        <PageHeader
          title={`Điểm số - ${userData.fullName}`}
          subtitle="Chi tiết điểm số và tiến độ học tập"
        />
      </div>

      {/* User Info Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                {userData.fullName.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData.fullName}</h2>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={`${getLevelColor(userData.currentLevel)} text-white border-0`}
                  >
                    {userData.currentLevel}
                  </Badge>
                  <Badge variant={userData.isActive ? "default" : "secondary"}>
                    {userData.isActive ? "Hoạt động" : "Tạm khóa"}
                  </Badge>
                  {userData.isVip && (
                    <Badge variant="outline" className="bg-yellow-500 text-white border-0">
                      VIP
                    </Badge>
                  )}
                </div>
                {userData.isVip && (
                  <div className="mt-2 space-y-1">
                    {userData.vipPlanName && (
                      <p className="text-sm text-muted-foreground">
                        Gói: <span className="font-semibold text-foreground">{userData.vipPlanName}</span>
                      </p>
                    )}
                    {userData.vipStartDate && (
                      <p className="text-sm text-muted-foreground">
                        Bắt đầu: <span className="font-semibold text-foreground">
                          {new Date(userData.vipStartDate).toLocaleDateString('vi-VN')}
                        </span>
                      </p>
                    )}
                    {userData.vipExpiryDate ? (
                      <p className="text-sm text-muted-foreground">
                        Hết hạn: <span className="font-semibold text-foreground">
                          {new Date(userData.vipExpiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </p>
                    ) : userData.vipPlanName && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-green-600">Vĩnh viễn</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round(userData.totalPoints || 0)}</div>
              <div className="text-sm text-muted-foreground">Tổng điểm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chuỗi hiện tại</p>
                <p className="text-2xl font-bold text-green-600">{userData.currentStreak || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chuỗi dài nhất</p>
                <p className="text-2xl font-bold text-blue-600">{userData.longestStreak || 0}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời gian học</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(userData.totalStudyTime || 0)}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoạt động cuối</p>
                <p className="text-sm font-bold text-orange-600">
                  {userData.lastActiveDate ? new Date(userData.lastActiveDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="progress">Tiến độ</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Điểm số theo kỹ năng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(skills).map(([skill, data]) => (
                  <div key={skill} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skillLabels[skill as keyof typeof skillLabels]}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.points}/{data.maxPoints}
                      </span>
                    </div>
                    <Progress value={data.progress} className="h-3" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">{data.points}</span>
                      <span className="text-sm text-muted-foreground ml-1">điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyError && (
                <p className="text-sm text-destructive mb-4">{historyError}</p>
              )}
              {!historyError && studyHistory.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Chưa có bản ghi lịch sử học tập (StudyHistory) cho người dùng này.
                </div>
              )}
              {!historyError && studyHistory.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Bài học</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tiến độ</TableHead>
                      <TableHead className="text-right">Thời lượng</TableHead>
                      <TableHead>Trình độ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studyHistory.map((row, idx) => (
                      <TableRow key={`${row.lessonId}-${row.createdAt}-${idx}`}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell>{categoryHistoryLabels[row.category]}</TableCell>
                        <TableCell className="max-w-[220px]">
                          <span className="line-clamp-2" title={row.lessonTitle}>
                            {row.lessonTitle}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.status === 'passed'
                                ? 'border-green-600 text-green-700'
                                : row.status === 'failed'
                                  ? 'border-red-500 text-red-600'
                                  : 'border-amber-500 text-amber-700'
                            }
                          >
                            {statusHistoryLabel(row.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Math.round(row.progress ?? 0)}%
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatStudyDuration(row.duration ?? 0)}
                        </TableCell>
                        <TableCell>{row.level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Phân tích tiến độ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Progress */}
                <div>
                  <h4 className="font-semibold mb-3">Tiến độ tổng thể</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Trình độ hiện tại: {userData.currentLevel || 'Chưa có'}</span>
                      <span>{Math.round(userData.totalPoints || 0)} / 1200 điểm</span>
                    </div>
                    <Progress value={Math.min(((userData.totalPoints || 0) / 1200) * 100, 100)} className="h-3" />
                    <div className="text-center text-sm text-muted-foreground">
                      Còn {Math.max(1200 - (userData.totalPoints || 0), 0)} điểm để lên cấp tiếp theo
                    </div>
                  </div>
                </div>

                {/* Skill Progress */}
                <div>
                  <h4 className="font-semibold mb-3">Tiến độ kỹ năng</h4>
                  <div className="space-y-3">
                    {Object.entries(skills).map(([skill, data]) => (
                      <div key={skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{skillLabels[skill as keyof typeof skillLabels]}</span>
                          <span>{Math.round(data.progress)}%</span>
                        </div>
                        <Progress value={data.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Đề xuất cải thiện</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tập trung vào kỹ năng Nói và Viết (hiện tại dưới 30%)</li>
                    <li>• Luyện tập Nghe hiểu để tăng điểm từ 50% lên 70%</li>
                    <li>• Duy trì chuỗi học tập hiện tại để củng cố thói quen học đều đặn</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
