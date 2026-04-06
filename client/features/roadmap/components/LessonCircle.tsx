import { cn } from '@/libs/utils'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock } from 'lucide-react'
import { lessonTypeConfig } from '../services/constants'

interface LessonCircleProps {
  type: string
  isUnlocked: boolean
  isCompleted: boolean
  progress: number
  isReview?: boolean
  onClick: () => void
  children: React.ReactNode
}

const RING_CX = 48
const RING_R = 44
const RING_STROKE = 5

export default function LessonCircle({
  type,
  isUnlocked,
  isCompleted,
  progress,
  isReview,
  onClick,
  children,
}: LessonCircleProps) {
  const config = lessonTypeConfig[type as keyof typeof lessonTypeConfig]
  const circumference = 2 * Math.PI * RING_R

  return (
    <motion.button
      onClick={onClick}
      disabled={!isUnlocked}
      whileHover={isUnlocked ? { scale: 1.1, y: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center text-white",
        "shadow-2xl transition-all duration-300 ring-4 ring-white",
        isUnlocked ? cn(config.color, config.hoverColor, "cursor-pointer", config.shadowColor) : "bg-gray-300 cursor-not-allowed opacity-60 grayscale",
        isReview && isUnlocked && "ring-2 ring-teal-300"
      )}
      style={{ filter: isUnlocked ? 'drop-shadow(0 15px 30px rgba(0,0,0,0.25))' : 'none' }}
    >
      {isUnlocked && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />}
      <div className={cn("relative z-10", isUnlocked ? "text-white" : "text-gray-500")}>{children}</div>
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-400/70 rounded-full backdrop-blur-sm">
          <Lock className="w-7 h-7 text-white drop-shadow-lg" />
        </div>
      )}
      {isCompleted && isUnlocked && (
        <motion.div
          className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg ring-2 ring-white z-20"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
        </motion.div>
      )}
      {isUnlocked && progress > 0 && !isCompleted && (
        <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
          <circle cx={RING_CX} cy={RING_CX} r={RING_R} stroke="rgba(255,255,255,0.3)" strokeWidth={RING_STROKE} fill="none" />
          <motion.circle
            cx={RING_CX} cy={RING_CX} r={RING_R}
            stroke="white" strokeWidth={RING_STROKE} fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      )}
      {isUnlocked && !isCompleted && (
        <motion.div
          className={cn("absolute inset-0 rounded-full border-4", config.color.replace('bg-', 'border-'))}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  )
}
