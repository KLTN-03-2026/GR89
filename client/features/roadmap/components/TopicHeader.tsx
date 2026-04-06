import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface TopicHeaderProps {
  isLocked: boolean
  isCompleted: boolean
  topic: {
    unitNumber: number
    title: string
    description: string
    icon: string
    progress: number
  }
}

export default function TopicHeader({ topic, isLocked, isCompleted }: TopicHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn(
        "rounded-3xl p-6 shadow-xl",
        isLocked ? "bg-gradient-to-br from-gray-300 to-gray-400 opacity-60"
          : isCompleted ? "bg-gradient-to-br from-green-400 to-emerald-500"
            : "bg-gradient-to-br from-sky-400 to-blue-500"
      )}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className={cn("w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-2xl", isLocked && "opacity-50")}
            animate={!isLocked ? { y: [0, -10, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {topic.icon}
          </motion.div>
          <div className="text-center">
            <h1 className={cn("text-2xl font-bold mb-1", isLocked ? "text-gray-600" : "text-white")}>
              Unit {topic.unitNumber}: {topic.title}
            </h1>
            <p className={cn("text-sm", isLocked ? "text-gray-500" : "text-blue-100")}>{topic.description}</p>
          </div>
          {!isLocked && (
            <>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className={cn("text-sm font-semibold", isLocked ? "text-gray-600" : "text-white")}>{topic.progress}% Hoàn thành</p>
            </>
          )}
          {isLocked && (
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="w-5 h-5" />
              <p className="text-sm">Hoàn thành Unit {topic.unitNumber - 1} để mở khóa</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
