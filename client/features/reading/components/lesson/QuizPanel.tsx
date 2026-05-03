'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, Lightbulb, Loader2 } from 'lucide-react'
import { IQuiz, IQuizResultData } from '@/features/quizz/types'
import { Input } from '@/components/ui/input'

interface QuizPanelProps {
  quizzes: IQuiz[]
  onSubmit: (results: IQuizResultData[]) => Promise<void>
}

export default function QuizPanel({ quizzes, onSubmit }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === quizzes.length
  const total = quizzes.length

  const results = useMemo(() => {
    if (!submitted) return null
    return quizzes.map((q, i) => {
      const userAnswer = answers[q._id] || ''
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
      return { quiz: q, userAnswer, isCorrect, index: i }
    })
  }, [submitted, quizzes, answers])

  const score = results ? results.filter(r => r.isCorrect).length : 0
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  const handleSelect = (quizId: string, option: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [quizId]: option }))
  }

  const handleSubmit = async () => {
    if (!allAnswered || submitted) return
    setIsSubmitting(true)
    try {
      const quizResults: IQuizResultData[] = quizzes.map((q, i) => {
        const userAnswer = answers[q._id] || ''
        return {
          questionNumber: i + 1,
          userAnswer: userAnswer.trim().toLowerCase(),
          quizId: q._id,
          isCorrect: userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase(),
        }
      })
      await onSubmit(quizResults)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-500">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex flex-col gap-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base tracking-tight uppercase">Kiểm tra kiến thức</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reading Comprehension</p>
            </div>
          </div>

          {submitted && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${percentage >= 80 ? 'bg-green-100 text-green-700' : percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
              {score}/{total} ĐÚNG
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>Tiến độ hoàn thành</span>
            <span>{Math.round((answeredCount / total) * 100)}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${submitted ? (percentage >= 80 ? 'bg-green-500' : 'bg-blue-500') : 'bg-blue-500'
                }`}
              style={{ width: `${(answeredCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar bg-slate-50/30">
        {quizzes.map((quiz, qIndex) => {
          const userAnswer = answers[quiz._id]
          const result = results?.[qIndex]

          return (
            <div key={quiz._id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${qIndex * 100}ms` }}>
              {/* Question card */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 shadow-sm ${submitted && result
                    ? result.isCorrect
                      ? 'bg-green-500 text-white shadow-green-200'
                      : 'bg-red-500 text-white shadow-red-200'
                    : userAnswer
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'bg-white text-slate-400 border-2 border-slate-100'
                    }`}>
                    {submitted && result ? (
                      result.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                    ) : (
                      qIndex + 1
                    )}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-[15px] font-bold text-slate-800 leading-relaxed tracking-tight">
                      {quiz.question}
                    </p>
                  </div>
                </div>

                {/* Options Grid / Input Field */}
                <div className="pl-14">
                  {quiz.type === 'Fill in the blank' ? (
                    <div className="relative group/input">
                      <Input
                        value={userAnswer || ''}
                        onChange={(e) => handleSelect(quiz._id, e.target.value)}
                        disabled={submitted}
                        placeholder="Nhập đáp án của bạn..."
                        className={`h-14 rounded-2xl border-2 px-6 text-[15px] font-bold transition-all duration-300 ${submitted && result
                          ? result.isCorrect
                            ? 'bg-green-50 border-green-500 text-green-700 ring-4 ring-green-500/10'
                            : 'bg-red-50 border-red-500 text-red-700 ring-4 ring-red-500/10'
                          : userAnswer
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/10'
                            : 'bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10'
                          }`}
                      />
                      {submitted && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {!result?.isCorrect && (
                            <span className="text-xs font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                              Đáp án: {quiz.answer}
                            </span>
                          )}
                          {result?.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {(quiz.options || []).map((option, oIndex) => {
                        const isSelected = userAnswer === option
                        const letter = String.fromCharCode(65 + oIndex)
                        const isCorrectAnswer = submitted && option.trim().toLowerCase() === quiz.answer.trim().toLowerCase()
                        const isWrongSelected = submitted && isSelected && !isCorrectAnswer

                        let optionStyle = "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50"
                        let letterStyle = "bg-slate-100 text-slate-500"

                        if (isSelected && !submitted) {
                          optionStyle = "bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/10"
                          letterStyle = "bg-blue-600 text-white"
                        }

                        if (submitted) {
                          if (isCorrectAnswer) {
                            optionStyle = "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-500/10"
                            letterStyle = "bg-green-600 text-white"
                          } else if (isWrongSelected) {
                            optionStyle = "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-500/10"
                            letterStyle = "bg-red-600 text-white"
                          } else {
                            optionStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60 grayscale cursor-default"
                            letterStyle = "bg-slate-200 text-slate-400"
                          }
                        }

                        return (
                          <button
                            key={option}
                            onClick={() => handleSelect(quiz._id, option)}
                            disabled={submitted}
                            className={`group/opt w-full text-left p-3.5 rounded-2xl border-2 text-[14px] font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${optionStyle}`}
                          >
                            <span className={`shrink-0 w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center transition-all duration-300 group-hover/opt:scale-110 ${letterStyle}`}>
                              {letter}
                            </span>
                            <span className="flex-1 leading-relaxed">{option}</span>

                            {submitted && isCorrectAnswer && (
                              <div className="bg-green-500 p-1 rounded-full animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {submitted && isWrongSelected && (
                              <div className="bg-red-500 p-1 rounded-full animate-in zoom-in duration-300">
                                <XCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Explanation Section */}
                {submitted && result && quiz.explanation && (
                  <div className={`ml-14 rounded-2xl p-4 text-[13px] leading-relaxed flex items-start gap-3 border animate-in slide-in-from-top-2 duration-500 ${result.isCorrect
                    ? 'bg-green-50/50 text-green-800 border-green-100'
                    : 'bg-amber-50/50 text-amber-800 border-amber-100'
                    }`}>
                    <div className={`mt-0.5 p-1 rounded-lg ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      <Lightbulb className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="font-black uppercase text-[10px] tracking-widest block mb-1">Giải thích</span>
                      <p className="font-medium">{quiz.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer / Action */}
      <div className="shrink-0 px-6 py-6 border-t border-slate-100 bg-white shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
        {!submitted ? (
          <div className="space-y-4">
            {!allAnswered && (
              <div className="flex items-center justify-center gap-2 text-[11px] font-black text-amber-600 uppercase tracking-widest">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Hoàn thành tất cả {total} câu để nộp bài</span>
              </div>
            )}
            <button
              className={`group w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${allAnswered && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              disabled={!allAnswered || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang chấm điểm...
                </>
              ) : (
                <>
                  Nộp bài & Kiểm tra
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            Thử lại bài học
          </button>
        )}
      </div>
    </div>
  )
}
