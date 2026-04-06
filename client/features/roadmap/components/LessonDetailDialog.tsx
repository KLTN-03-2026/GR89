import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import type { IPALesson, IPATopic } from '../types'
import { lessonTypeConfig } from '../services/constants'
import { getLessonIcon, getLessonLink } from '../services/lessonConfig'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface LessonDetailDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (v: boolean) => void
  selectedLesson: IPALesson | null
  topic: IPATopic | null
}

export default function LessonDetailDialog({ isDialogOpen, setIsDialogOpen, selectedLesson, topic }: LessonDetailDialogProps) {
  if (!selectedLesson || !topic) return null

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", lessonTypeConfig[selectedLesson.type].color)}>
              {getLessonIcon(selectedLesson.type as keyof typeof lessonTypeConfig)}
            </div>
            <div>
              <div>{selectedLesson.type === 'ipa' ? `/${selectedLesson.title}/` : selectedLesson.title}</div>
              <DialogDescription className="text-base mt-1">Unit 1: {topic.title}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Tiến độ</span>
              <span className="font-semibold text-blue-600">{selectedLesson.progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", lessonTypeConfig[selectedLesson.type].color)}
                initial={{ width: 0 }}
                animate={{ width: `${selectedLesson.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <Link href={getLessonLink(selectedLesson.type, selectedLesson._id) as string}>
            <Button className={cn(
              "mt-4 w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all",
              selectedLesson.isCompleted ? "bg-green-500 hover:bg-green-600"
                : lessonTypeConfig[selectedLesson.type].color + " " + lessonTypeConfig[selectedLesson.type].hoverColor
            )}>
              {selectedLesson.isCompleted ? 'Ôn tập lại' : selectedLesson.type === 'review' ? 'Bắt đầu bài tập' : 'Bắt đầu học'}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
