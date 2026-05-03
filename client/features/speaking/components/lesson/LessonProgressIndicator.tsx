'use client'

interface LessonProgressIndicatorProps {
  currentIndex: number
  total: number
}

export function LessonProgressIndicator({ currentIndex, total }: LessonProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center py-4 space-x-2">
      <span className="text-sm text-gray-500">
        Câu {currentIndex + 1} / {total || 0}
      </span>
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
    </div>
  )
}

