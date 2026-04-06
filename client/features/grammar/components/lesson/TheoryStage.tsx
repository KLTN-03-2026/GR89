'use client'

import { ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react'
import { SectionView } from './SectionView'
import type { LessonSection } from '@/features/grammar/types'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface TheoryStageProps {
  section: LessonSection
  index: number
  total: number
  onChangeIndex: (fn: (prev: number) => number) => void
  onComplete: () => void
}

export function TheoryStage({
  section,
  index,
  total,
  onChangeIndex,
  onComplete
}: TheoryStageProps) {
  const isFirst = index === 0
  const isLast = index === total - 1
  const progress = ((index + 1) / total) * 100

  const handleBack = () => {
    if (!isFirst) {
      onChangeIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (!isLast) {
      onChangeIndex(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300"
    >
      {/* Top Header & Progress */}
      <div className="mb-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Lý thuyết {index + 1}/{total}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                Kiến thức nền tảng
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang học lý thuyết</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
      </div>

      <SectionView section={section} />

      {/* Navigation Buttons */}
      <div className="mt-12 flex items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-900">
        <Button
          variant="outline"
          size="lg"
          className="rounded-2xl px-8 font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-30"
          disabled={isFirst}
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Quay lại</span>
        </Button>

        <Button
          size="lg"
          className="rounded-2xl px-10 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          onClick={handleNext}
        >
          {isLast ? (
            <>
              <span>Hoàn thành</span>
              <CheckCircle className="h-5 w-5" />
            </>
          ) : (
            <>
              <span>Tiếp theo</span>
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </motion.section>
  )
}