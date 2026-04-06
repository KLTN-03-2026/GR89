'use client'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import type { AssessmentResult } from './types'

interface LessonNavigationProps {
  currentSubtitleIndex: number
  total: number
  setCurrentSubtitleIndex: (index: number | ((prev: number) => number)) => void
  setAssessmentResult: (result: AssessmentResult | null) => void
  setReplayTrigger: (value: number | ((prev: number) => number)) => void
}

export function LessonNavigation({
  currentSubtitleIndex,
  total,
  setCurrentSubtitleIndex,
  setAssessmentResult,
  setReplayTrigger
}: LessonNavigationProps) {
  const handlePrevious = () => {
    setAssessmentResult(null)

    if (currentSubtitleIndex > 0) {
      setCurrentSubtitleIndex(prev => prev - 1)
      setReplayTrigger(0)
    }
  }

  const disablePrevious = currentSubtitleIndex === 0
  return (
    <div className="flex items-center justify-between px-6 pb-6">
      <Button
        onClick={handlePrevious}
        disabled={disablePrevious}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Câu {currentSubtitleIndex + 1} / {total || 0}
        </p>
      </div>

      <div className="w-24" />
    </div>
  )
}

