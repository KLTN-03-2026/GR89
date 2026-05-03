import { Card, CardContent } from "@/components/ui/card"
import { formatStudyTime } from "@/lib/utils"
import { TrendingUp, Users, Award, Clock } from "lucide-react"

interface UserScoresStatsCardsProps {
  totalUsers: number
  averagePoints: number
  totalStudyTime: number
  activeUsers: number
}

export function UserScoresStatsCards({
  totalUsers,
  averagePoints,
  totalStudyTime,
  activeUsers,
}: UserScoresStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
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
              <p className="text-2xl font-bold">{averagePoints}</p>
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
              <p className="text-2xl font-bold">{formatStudyTime(totalStudyTime)}</p>
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
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
            <Award className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

