import { useState } from 'react'
import { cn } from '@/libs/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronDown, Lock, ChevronRight } from 'lucide-react'
import type { IPALesson, IPALessonGroup } from '../types'
import { lessonTypeConfig, typeLabel } from '../services/constants'
import { getLessonIcon } from '../services/lessonConfig'
import LessonCircle from './LessonCircle'

interface GroupedLessonNodeProps {
  group: IPALessonGroup
  allLessons: IPALesson[]
  animationDelay: number
  onLessonClick: (lesson: IPALesson) => void
}

function getGroupLabel(group: IPALessonGroup): string {
  const first = group.lessons[0]
  const last = group.lessons[group.lessons.length - 1]
  if (group.type === 'ipa') return `/${first.title}/ → /${last.title}/`
  if (group.lessons.length === 2) return `${first.title} & ${last.title}`
  return `${first.title} → ${last.title}`
}

export default function GroupedLessonNode({ group, allLessons, animationDelay, onLessonClick }: GroupedLessonNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const config = lessonTypeConfig[group.type as keyof typeof lessonTypeConfig]
  const completedCount = group.lessons.filter(l => l.isCompleted).length
  const allCompleted = completedCount === group.lessons.length
  const firstIndex = group.startIndex
  const canUnlock = firstIndex === 0 || allLessons[firstIndex - 1].isCompleted
  const isUnlocked = group.lessons[0].isUnlocked && canUnlock
  const avgProgress = Math.round(group.lessons.reduce((sum, l) => sum + l.progress, 0) / group.lessons.length)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-3"
    >
      <LessonCircle type={group.type} isUnlocked={isUnlocked} isCompleted={allCompleted} progress={avgProgress} onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col items-center">
          {getLessonIcon(group.type as IPALesson['type'])}
          <span className="text-[10px] font-bold mt-0.5 opacity-90">{group.lessons.length} bài</span>
        </div>
      </LessonCircle>
      <div className="text-center max-w-[240px]">
        <p className={cn("text-base font-bold mb-0.5", isUnlocked ? "text-gray-800" : "text-gray-400")}>{getGroupLabel(group)}</p>
        <p className={cn("text-sm", isUnlocked ? "text-gray-500" : "text-gray-400")}>
          {group.lessons.length} {typeLabel[group.type] || 'bài'}
          {completedCount > 0 && ` · ${completedCount}/${group.lessons.length} xong`}
        </p>
        {isUnlocked && (
          <button onClick={() => setExpanded(!expanded)} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-3.5 h-3.5" /></motion.span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {expanded && isUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden w-full max-w-[320px]"
          >
            <div className={cn("rounded-2xl overflow-hidden", "bg-white shadow-xl shadow-gray-200/60", "border border-gray-100")}>
              <div className={cn("px-4 py-3 flex items-center gap-2.5", config.color, "text-white")}>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">{getLessonIcon(group.type as IPALesson['type'])}</div>
                <div className="flex-1"><p className="text-sm font-bold">{group.lessons.length} {typeLabel[group.type] || 'bài'}</p></div>
                {completedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${(completedCount / group.lessons.length) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-white/80">{completedCount}/{group.lessons.length}</span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {group.lessons.map((lesson, i) => (
                  <ExpandedLessonItem
                    key={lesson._id}
                    lesson={lesson}
                    index={i}
                    globalIndex={group.startIndex + i}
                    allLessons={allLessons}
                    config={config}
                    onLessonClick={onLessonClick}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ExpandedLessonItem({
  lesson,
  index,
  globalIndex,
  allLessons,
  config,
  onLessonClick,
}: {
  lesson: IPALesson
  index: number
  globalIndex: number
  allLessons: IPALesson[]
  config: (typeof lessonTypeConfig)[keyof typeof lessonTypeConfig]
  onLessonClick: (l: IPALesson) => void
}) {
  const canUnlock = globalIndex === 0 || allLessons[globalIndex - 1].isCompleted
  const isUnlocked = lesson.isUnlocked && canUnlock
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => isUnlocked && onLessonClick(lesson)}
      disabled={!isUnlocked}
      className={cn("w-full flex items-center gap-3 px-4 py-3 transition-all group", isUnlocked ? "hover:bg-gray-50 active:bg-gray-100 cursor-pointer" : "opacity-45 cursor-not-allowed")}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform", isUnlocked ? config.color : "bg-gray-300", isUnlocked && "group-hover:scale-110 group-hover:shadow-md")}>
        {!isUnlocked ? <Lock className="w-4 h-4" /> : lesson.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : getLessonIcon(lesson.type as IPALesson['type'])}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn("text-sm font-semibold truncate transition-colors", isUnlocked ? "text-gray-800 group-hover:text-gray-950" : "text-gray-400")}>
          {lesson.type === 'ipa' ? `/${lesson.title}/` : lesson.title}
        </p>
        {isUnlocked && lesson.progress > 0 && !lesson.isCompleted && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className={cn("h-full rounded-full", config.color)} initial={{ width: 0 }} animate={{ width: `${lesson.progress}%` }} transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.04 }} />
            </div>
            <span className="text-[11px] font-medium text-gray-400">{lesson.progress}%</span>
          </div>
        )}
        {lesson.isCompleted && isUnlocked && <p className="text-xs font-medium text-green-500 mt-0.5">Hoàn thành</p>}
        {!isUnlocked && <p className="text-[11px] text-gray-400 mt-0.5">Chưa mở khóa</p>}
      </div>
      {isUnlocked && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 transition-all group-hover:text-gray-500 group-hover:translate-x-0.5" />}
    </motion.button>
  )
}
