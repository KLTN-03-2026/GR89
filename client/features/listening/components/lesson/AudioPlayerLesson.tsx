import { Card, CardContent } from '@/components/ui/card'
import { Music2 } from 'lucide-react'

export default function AudioPlayerLesson() {
  return (
    <Card className="relative overflow-hidden border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl">
      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Main audio section */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
            <Music2 className="w-4 h-4" />
            Trình phát audio
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

