'use client'

import { Trophy, BookOpen, RefreshCcw, Star, StarOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import Link from 'next/link'

interface ResultStageProps {
  score: number
  total: number
  onReviewTheory: () => void
  onRetryPractice: () => void
}

export function ResultStage({
  score,
  total,
  onReviewTheory,
  onRetryPractice
}: ResultStageProps) {

  const isPerfect = score === total
  const percentage = Math.round((score / total) * 100)

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 p-8 md:p-12 text-center shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
    >
      {/* Decorative background stars */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <Star className="absolute top-10 left-10 w-8 h-8 rotate-12" />
        <Star className="absolute bottom-20 right-10 w-12 h-12 -rotate-12" />
        <Trophy className="absolute top-1/2 left-1/4 w-24 h-24 -translate-y-1/2 opacity-5" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 space-y-8"
      >
        <div className="mx-auto relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
            className={cn(
              "mx-auto flex h-32 w-32 items-center justify-center rounded-[2.5rem] shadow-xl rotate-12",
              isPerfect 
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/20" 
                : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/20"
            )}
          >
            <Trophy className="h-16 w-16 -rotate-12" />
          </motion.div>
          
          {/* Rating Stars */}
          <div className="flex justify-center gap-1 mt-6">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = percentage >= star * 20
              return (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + star * 0.1 }}
                >
                  {active ? (
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  ) : (
                    <StarOff className="w-6 h-6 text-slate-200 dark:text-slate-800" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Kết quả bài học
          </p>
          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
            {score}<span className="text-3xl text-slate-300 dark:text-slate-700">/{total}</span>
          </h2>
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
            Hoàn thành {percentage}% mục tiêu
          </div>
        </div>

        <p className="text-lg font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isPerfect
            ? 'Tuyệt vời! Bạn đã nắm vững hoàn toàn nội dung bài học này. Hãy tiếp tục duy trì phong độ nhé!'
            : 'Bạn đã hoàn thành bài học. Một chút ôn tập nữa sẽ giúp bạn đạt điểm tối đa đấy!'}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl px-8 font-bold gap-2 border-slate-200 dark:border-slate-800 h-14 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95"
            onClick={onReviewTheory}
          >
            <BookOpen className="h-5 w-5" />
            Ôn lại lý thuyết
          </Button>

          <Button
            size="lg"
            className={cn(
              "rounded-2xl px-10 font-bold gap-2 h-14 shadow-lg transition-all active:scale-95",
              isPerfect 
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
            )}
            onClick={onRetryPractice}
          >
            <RefreshCcw className="h-5 w-5" />
            Luyện tập lại
          </Button>
        </div>

        <div className="pt-8">
          <Link href="/study/grammar">
            <Button variant="ghost" className="text-slate-400 hover:text-purple-600 font-bold gap-2 group">
              Quay lại danh sách bài học
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.section>
  )
}