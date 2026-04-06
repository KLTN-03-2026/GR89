import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, Music, Radio } from "lucide-react"
import type { EntertainmentStatsEntry, EntertainmentType } from '@/features/entertainment'

const ENTERTAINMENT_TYPES: Array<{
  key: EntertainmentType
  label: string
  Icon: typeof Film
  gradient: string
}> = [
    { key: "movie", label: "Phim & Video", Icon: Film, gradient: "from-red-500 to-pink-500" },
    { key: "music", label: "Âm nhạc", Icon: Music, gradient: "from-purple-500 to-indigo-500" },
    { key: "podcast", label: "Podcast", Icon: Radio, gradient: "from-teal-500 to-cyan-500" },
  ]

interface EntertainmentStatsProps {
  stats: EntertainmentStatsEntry[]
}

export default function EntertainmentStats({ stats }: EntertainmentStatsProps) {
  const statsRecord: Record<EntertainmentType, EntertainmentStatsEntry | null> = {
    movie: null,
    music: null,
    podcast: null
  }

  stats.forEach((entry) => {
    statsRecord[entry.type] = entry
  })

  return (
    <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            🎬 Giải trí
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ENTERTAINMENT_TYPES.map((config) => {
            const Icon = config.Icon
            const stat = statsRecord[config.key]
            const total = stat?.totalItems || 0
            const viewed = stat?.viewedCount || 0
            const percentage = total > 0 ? Math.round((viewed / total) * 100) : 0
            return (
              <div key={config.key} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg text-white bg-gradient-to-r ${config.gradient}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{config.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {`${total} nội dung`}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-white/60 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className={`bg-gradient-to-r ${config.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {total > 0 && viewed > 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {`${viewed}/${total} đã xem (${percentage}%)`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Chưa có dữ liệu</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
