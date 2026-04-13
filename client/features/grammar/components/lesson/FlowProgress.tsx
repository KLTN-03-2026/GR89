'use client'

import { BookOpen, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react'
import type { StudyStage } from '@/features/grammar/types'
import { motion } from 'framer-motion'
import { cn } from '@/libs/utils'

interface FlowProgressProps {
  stage: StudyStage
  theoryIndex: number
  practiceIndex: number
  totalTheory: number
  totalPractice: number
}

const stageItems = [
  { key: 'theory' as const, label: 'Lý thuyết', icon: BookOpen, color: 'emerald' },
  { key: 'practice' as const, label: 'Luyện tập', icon: Sparkles, color: 'purple' },
  { key: 'quiz' as const, label: 'Kiểm tra', icon: GraduationCap, color: 'amber' },
]

export function FlowProgress({
  stage,
  theoryIndex,
  practiceIndex,
  totalPractice,
  totalTheory,
}: FlowProgressProps) {
  const totalSteps = totalTheory + totalPractice

  const currentStep = () => {
    if (stage === 'theory') return theoryIndex + 1
    return totalTheory + practiceIndex + 1
  }

  const progressPercent = totalSteps > 0 ? Math.round((currentStep() / totalSteps) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none md:p-8"
    >
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tiến độ bài học</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{progressPercent}%</span>
              <span className="text-xs font-bold text-slate-400">hoàn thành</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Bước {currentStep()} / {totalSteps}
            </span>
          </div>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900 p-1 border border-slate-50 dark:border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 shadow-sm shadow-purple-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <motion.div
              animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {stageItems.map((item, idx) => {
          const active = stage === item.key
          const completed = item.key === 'theory' && stage === 'practice'

          const Icon = item.icon

          return (
            <div className="flex-1 min-w-[120px] relative group" key={item.key}>
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300',
                  active
                    ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-950 shadow-lg'
                    : completed
                      ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400'
                      : 'border-slate-50 dark:border-slate-900 bg-white dark:bg-gray-950 text-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500',
                    active && item.key === 'theory'
                      ? 'bg-emerald-500 text-white rotate-6'
                      : active && item.key === 'practice'
                        ? 'bg-purple-500 text-white rotate-6'
                        : completed
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-300'
                  )}
                >
                  {completed && !active ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      active ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                    )}
                  >
                    Bước {idx + 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      active ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </div>

              {idx < stageItems.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2" />
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
