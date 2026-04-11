'use client'

import { ChevronLeft, ChevronRight, Trophy, CheckCircle2, Circle } from 'lucide-react'
import type { QuizQuestion } from '@/features/grammar/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'

interface QuizStageProps {
  question: QuizQuestion
  index: number
  total: number
  selectedAnswer: string
  onSelect: (option: string) => void
  onChangeIndex: (fn: (prev: number) => number) => void
  onComplete: () => void
}

export function QuizStage({
  question,
  index,
  total,
  selectedAnswer,
  onSelect,
  onChangeIndex,
  onComplete
}: QuizStageProps) {
  const isFirst = index === 0
  const isLast = index === total - 1
  const canNext = !!selectedAnswer
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

  console.log(question)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none"
    >
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Quiz {index + 1}/{total}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                Kiểm tra cuối bài
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-800/50">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Chế độ tính điểm</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-8">
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden group text-center">
          <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Trophy className="w-24 h-24" />
          </div>

          <p className="relative z-10 text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-200 leading-tight tracking-tight">
            {question.question}
          </p>
        </div>

        {/* Options Section */}
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {question.options.map((option, idx) => {
              const selected = selectedAnswer === option
              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, x: 10 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelect(option)}
                  className={cn(
                    "group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                    selected
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg shadow-amber-500/10"
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-950 hover:border-amber-200 dark:hover:border-amber-800"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors",
                      selected ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={cn(
                      "text-base font-bold",
                      selected ? "text-amber-900 dark:text-amber-100" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {option}
                    </span>
                  </div>

                  {selected ? (
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-200 dark:text-slate-800 group-hover:text-amber-200" />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-900">
        <Button
          variant="outline"
          size="lg"
          className="rounded-2xl px-8 font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-30"
          disabled={isFirst}
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Câu trước</span>
        </Button>

        <Button
          size="lg"
          className={cn(
            "rounded-2xl px-10 font-bold gap-2 transition-all active:scale-95 shadow-lg",
            canNext
              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
              : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 shadow-none cursor-not-allowed"
          )}
          disabled={!canNext}
          onClick={handleNext}
        >
          <span>{isLast ? 'Nộp bài & Kết thúc' : 'Câu tiếp theo'}</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.section>
  )
}