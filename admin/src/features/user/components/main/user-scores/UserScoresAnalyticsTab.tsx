import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SkillAnalysis, TopUser, UserScore } from "@/features/user/types"
import { formatScore } from "@/lib/scoreUtils"

interface UserScoresAnalyticsTabProps {
  topUsers: TopUser[]
  userScores: UserScore[]
  skillAnalysis: SkillAnalysis[]
}

export function UserScoresAnalyticsTab({
  topUsers,
  userScores,
  skillAnalysis,
}: UserScoresAnalyticsTabProps) {
  const fallbackTopUsers = [...userScores].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5)
  const fallbackSkillAnalysis = userScores.length > 0
    ? [
      { name: "Từ vựng", avg: Math.round(userScores.reduce((sum, u) => sum + u.vocabularyPoints, 0) / userScores.length) },
      { name: "Ngữ pháp", avg: Math.round(userScores.reduce((sum, u) => sum + u.grammarPoints, 0) / userScores.length) },
      { name: "Đọc hiểu", avg: Math.round(userScores.reduce((sum, u) => sum + u.readingPoints, 0) / userScores.length) },
      { name: "Nghe hiểu", avg: Math.round(userScores.reduce((sum, u) => sum + u.listeningPoints, 0) / userScores.length) },
      { name: "Nói", avg: Math.round(userScores.reduce((sum, u) => sum + u.speakingPoints, 0) / userScores.length) },
      { name: "Viết", avg: Math.round(userScores.reduce((sum, u) => sum + u.writingPoints, 0) / userScores.length) },
    ]
    : []

  const displayTopUsers = topUsers.length > 0 ? topUsers : fallbackTopUsers
  const displaySkillAnalysis = skillAnalysis.length > 0 ? skillAnalysis : fallbackSkillAnalysis

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top người dùng theo điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayTopUsers.map((user, index) => (
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
            {displaySkillAnalysis.map((skill) => (
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
  )
}

