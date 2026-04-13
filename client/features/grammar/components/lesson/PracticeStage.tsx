'use client'

import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, AlertCircle, RefreshCcw, Send } from 'lucide-react'
import type { PracticeQuestion, PracticeStatus } from '@/features/grammar/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'

interface PracticeStageProps {
  question: PracticeQuestion
  index: number
  total: number
  answer: string
  status: PracticeStatus
  onAnswerChange: (value: string) => void
  onChangeIndex: (fn: (prev: number) => number) => void
  onUpdateStatus: (status: PracticeStatus) => void
  onComplete: () => void
}

export function PracticeStage({
  question,
  index,
  total,
  answer,
  status,
  onAnswerChange,
  onChangeIndex,
  onUpdateStatus,
  onComplete
}: PracticeStageProps) {

  // 🔹 derive state
  const isFirst = index === 0
  const isLast = index === total - 1
  const hasAnswer = Boolean(answer.trim())
  const progress = ((index + 1) / total) * 100

  // 🔹 label
  const getTypeLabel = () => {
    if (question.type === 'fill_blank') return 'Điền vào chỗ trống'
    if (question.type === 'multiple_choice') return 'Trắc nghiệm'
    return 'Sửa lỗi câu'
  }

  // 🔹 check logic
  const handleCheck = () => {
    const userAnswer = answer.trim().toLowerCase()
    let isCorrect = false

    if (question.type === 'fill_blank' || question.type === 'correct_sentence') {
      isCorrect = userAnswer === question.answer.trim().toLowerCase()
    } else {
      isCorrect = answer === question.answer
    }

    onUpdateStatus(isCorrect ? 'correct' : 'wrong')
  }

  // 🔹 reset
  const handleReset = () => {
    onAnswerChange('')
    onUpdateStatus('idle')
  }

  // 🔹 navigation
  const handleBack = () => {
    if (!isFirst) onChangeIndex(prev => prev - 1)
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none"
    >
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Luyện tập {index + 1}/{total}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                Vận dụng kiến thức
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            {getTypeLabel()}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <HelpCircle className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {question.question}
            </p>

            {question.type === 'correct_sentence' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/30">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400 italic">
                  Câu sai: <span className="underline decoration-rose-300 decoration-2 underline-offset-4">{question.wrongSentence}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {question.type === 'multiple_choice' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {question.options.map((option, idx) => {
                  const selected = answer === option
                  return (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => status === 'idle' && onAnswerChange(option)}
                      disabled={status !== 'idle'}
                      className={cn(
                        "group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                        selected
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/10"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-950 hover:border-purple-200 dark:hover:border-purple-800"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors",
                        selected ? "bg-purple-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={cn(
                        "text-sm font-bold",
                        selected ? "text-purple-900 dark:text-purple-100" : "text-slate-600 dark:text-slate-400"
                      )}>
                        {option}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <input
                  className={cn(
                    "w-full rounded-2xl border-2 bg-white dark:bg-gray-950 px-6 py-4 text-lg font-bold outline-none transition-all",
                    status === 'correct' ? "border-emerald-500 text-emerald-700" :
                      status === 'wrong' ? "border-rose-500 text-rose-700" :
                        "border-slate-100 dark:border-slate-800 focus:border-purple-500"
                  )}
                  disabled={status === 'correct'}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Nhập đáp án của bạn..."
                  value={answer}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Send className="w-5 h-5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Messages */}
          <AnimatePresence>
            {status === 'correct' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-black">Tuyệt vời! Đáp án chính xác. Hãy tiếp tục nào!</p>
              </motion.div>
            )}

            {status === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-black">Chưa chính xác rồi...</p>
                  <p className="text-xs font-bold opacity-80 italic">Gợi ý: {question.hint}</p>
                  <div className="mt-2 pt-3 border-t border-rose-200/60 dark:border-rose-800/50">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                      Đáp án đúng
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed not-italic">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
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

        <div className="flex gap-3">
          {status === 'wrong' && (
            <Button
              variant="secondary"
              size="lg"
              className="rounded-2xl px-8 font-bold gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 transition-all active:scale-95"
              onClick={handleReset}
            >
              <RefreshCcw className="h-5 w-5" />
              Làm lại
            </Button>
          )}

          <Button
            size="lg"
            className={cn(
              "rounded-2xl px-10 font-bold gap-2 transition-all active:scale-95 shadow-lg",
              status === 'correct'
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
            )}
            disabled={status === 'idle' ? !hasAnswer : false}
            onClick={() => {
              if (status === 'correct') handleNext()
              else if (status === 'wrong') handleReset()
              else handleCheck()
            }}
          >
            {status === 'correct' ? (
              <>
                <span>{isLast ? 'Làm bài kiểm tra' : 'Tiếp theo'}</span>
                <ChevronRight className="h-5 w-5" />
              </>
            ) : (
              <>
                <span>Kiểm tra</span>
                <CheckCircle2 className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.section>
  )
}