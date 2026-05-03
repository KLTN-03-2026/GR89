import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserScore } from "@/features/user/types"
import { formatScore } from "@/lib/scoreUtils"

interface UserScoresDetailedTabProps {
  userScores: UserScore[]
}

export function UserScoresDetailedTab({ userScores }: UserScoresDetailedTabProps) {
  return (
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
                <p className="text-sm text-muted-foreground">{formatScore(user.totalPoints)} điểm</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
  )
}

