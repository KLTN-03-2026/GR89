import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Headphones, Mic, PenTool, Book } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LessonStatsResponse } from '@/libs/apis/api'

interface SkillProgressProps {
  lessonStats: LessonStatsResponse | null
}

export default function SkillsProgress({ lessonStats }: SkillProgressProps) {
  const skillsData = [
    {
      name: 'Vocabulary',
      icon: BookOpen,
      completed: lessonStats?.vocabulary?.completed || 0,
      total: lessonStats?.vocabulary?.totalAvailable || lessonStats?.vocabulary?.total || 0,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900',
      iconBg: 'bg-blue-500'
    },
    {
      name: 'Grammar',
      icon: Brain,
      completed: lessonStats?.grammar?.completed || 0,
      total: lessonStats?.grammar?.totalAvailable || lessonStats?.grammar?.total || 0,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900',
      iconBg: 'bg-purple-500'
    },
    {
      name: 'Reading',
      icon: Book,
      completed: lessonStats?.reading?.completed || 0,
      total: lessonStats?.reading?.totalAvailable || lessonStats?.reading?.total || 0,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900',
      iconBg: 'bg-green-500'
    },
    {
      name: 'Listening',
      icon: Headphones,
      completed: lessonStats?.listening?.completed || 0,
      total: lessonStats?.listening?.totalAvailable || lessonStats?.listening?.total || 0,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900',
      iconBg: 'bg-orange-500'
    },
    {
      name: 'Speaking',
      icon: Mic,
      completed: lessonStats?.speaking?.completed || 0,
      total: lessonStats?.speaking?.totalAvailable || lessonStats?.speaking?.total || 0,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-950 dark:hover:bg-pink-900',
      iconBg: 'bg-pink-500'
    },
    {
      name: 'Writing',
      icon: PenTool,
      completed: lessonStats?.writing?.completed || 0,
      total: lessonStats?.writing?.totalAvailable || lessonStats?.writing?.total || 0,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900',
      iconBg: 'bg-indigo-500'
    },
  ]

  const completedSkills = skillsData.filter(s => s.completed > 0).length

  return (
    <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              🎯 Tiến độ kỹ năng
            </CardTitle>
            <CardDescription>Điểm số của bạn theo từng kỹ năng</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm font-semibold border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
            {completedSkills}/6 kỹ năng
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsData.map((skill) => {
            const Icon = skill.icon
            const percentage = skill.total > 0 ? (skill.completed / skill.total) * 100 : 0

            return (
              <div
                key={skill.name}
                className={`${skill.bgColor} rounded-xl p-4 border-0 transition-all duration-300 cursor-pointer hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`${skill.iconBg} p-2 rounded-lg shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{skill.name}</span>
                  </div>
                  <span className={`text-lg font-bold bg-gradient-to-r ${skill.color} bg-clip-text text-transparent`}>
                      {`${percentage.toFixed(0)}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/50 dark:bg-gray-800 rounded-full h-2 mb-2 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${skill.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {skill.total > 0 ? `${skill.completed}/${skill.total} bài` : 'Chưa có dữ liệu'}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

