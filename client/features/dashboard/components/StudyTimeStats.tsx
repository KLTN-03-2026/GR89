import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LessonSkillStats, LessonStatsResponse } from '@/libs/apis/api'
import { BookOpen, Brain, Book, Headphones, Mic, PenTool, Volume2 } from "lucide-react"
import { formatStudyTime } from "@/libs/utils/formatStudyTime"

interface StudyTimeStatsProps {
  lessonStats: LessonStatsResponse | null
}

const SKILLS = [
  { key: "vocabulary", label: "Từ vựng", Icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
  { key: "grammar", label: "Ngữ pháp", Icon: Brain, gradient: "from-purple-500 to-pink-500" },
  { key: "reading", label: "Đọc hiểu", Icon: Book, gradient: "from-green-500 to-emerald-500" },
  { key: "listening", label: "Nghe hiểu", Icon: Headphones, gradient: "from-orange-500 to-red-500" },
  { key: "speaking", label: "Nói", Icon: Mic, gradient: "from-pink-500 to-rose-500" },
  { key: "writing", label: "Viết", Icon: PenTool, gradient: "from-indigo-500 to-blue-500" },
  { key: "ipa", label: "IPA", Icon: Volume2, gradient: "from-amber-500 to-yellow-500" }
] as const

export default function StudyTimeStats({ lessonStats }: StudyTimeStatsProps) {
  if (!lessonStats) return null
  const statsRecord = lessonStats as unknown as Record<string, LessonSkillStats | undefined>

  const stats = SKILLS.map(({ key, label, Icon, gradient }) => {
    const skill = statsRecord[key]
    const totalSeconds = Number(skill?.totalTime || 0)
    return {
      label,
      Icon,
      gradient,
      totalSeconds
    }
  })

  const activeSkills = stats.filter((stat) => stat.totalSeconds > 0)

  return (
    <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            ⏱️ Thời gian học theo kỹ năng
          </CardTitle>
          <Badge variant="outline" className="text-sm font-semibold border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
            {activeSkills.length}/{stats.length} kỹ năng đang học
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {stats.map(({ label, Icon, gradient, totalSeconds }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white bg-gradient-to-r ${gradient}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Cộng dồn</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatStudyTime(totalSeconds)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

