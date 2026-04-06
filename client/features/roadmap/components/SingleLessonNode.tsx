import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import type { IPALesson } from '../types'
import { getLessonIcon } from '../services/lessonConfig'
import LessonCircle from './LessonCircle'

interface SingleLessonNodeProps {
  lesson: IPALesson
  globalIndex: number
  allLessons: IPALesson[]
  animationDelay: number
  onLessonClick: (lesson: IPALesson) => void
}

function getUnlockState(lesson: IPALesson, globalIndex: number, allLessons: IPALesson[]) {
  const canUnlock = globalIndex === 0 || allLessons[globalIndex - 1].isCompleted
  const isUnlocked = lesson.isUnlocked && canUnlock
  const isReview = lesson.type === 'review'
  const reviewUnlocked = isReview ? allLessons.slice(0, globalIndex).every(l => l.isCompleted) : isUnlocked
  return { isReview, reviewUnlocked }
}

export default function SingleLessonNode({ lesson, globalIndex, allLessons, animationDelay, onLessonClick }: SingleLessonNodeProps) {
  const { isReview, reviewUnlocked } = getUnlockState(lesson, globalIndex, allLessons)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-3"
    >
      <LessonCircle
        type={lesson.type}
        isUnlocked={reviewUnlocked}
        isCompleted={lesson.isCompleted}
        progress={lesson.progress}
        isReview={isReview}
        onClick={() => onLessonClick(lesson)}
      >
        {getLessonIcon(lesson.type)}
      </LessonCircle>
      <div className="text-center">
        <p className={cn("text-base font-bold mb-0.5", reviewUnlocked ? "text-gray-800" : "text-gray-400")}>
          {lesson.type === 'ipa' ? `/${lesson.title}/` : lesson.title}
        </p>
        {reviewUnlocked && lesson.progress > 0 && !lesson.isCompleted && <p className="text-sm font-semibold text-gray-600">{lesson.progress}%</p>}
        {lesson.isCompleted && reviewUnlocked && <p className="text-sm font-semibold text-green-600">Hoàn thành</p>}
        {!reviewUnlocked && <p className="text-sm text-gray-400">{isReview ? "Hoàn thành tất cả bài trước" : "Chưa mở khóa"}</p>}
      </div>
    </motion.div>
  )
}
