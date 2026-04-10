'use client'

import { useState, useMemo } from 'react'
import { AudioPlayerPauseOnly } from '@/components/common/medias'
import { CheckCircle2, ChevronRight, XCircle, HelpCircle } from 'lucide-react'
import Image from 'next/image'

export type ListeningQuizType =
  | 'picture_description'
  | 'choose_answer'
  | 'dialogue_1'
  | 'dialogue_3'
  | 'monologue_3'

export interface ListeningQuizQuestion {
  _id: string
  type: ListeningQuizType
  question: string
  imageUrl?: string // 1 ảnh cho câu hỏi (picture_description)
  options: { text: string; imageUrl?: string }[]
  answer: string
}

interface ListeningQuizStepProps {
  audioUrl: string
  title: string
  questions: ListeningQuizQuestion[]
  blockQuestionRange?: string // Câu 41-43, 1-10, 67-70...
  onSubmit: (result: { correct: number; total: number; percentage: number }) => void
}

const typeLabels: Record<ListeningQuizType, string> = {
  picture_description: 'Nghe chọn mô tả tranh',
  choose_answer: 'Nghe chọn đáp án đúng',
  dialogue_1: 'Nghe hội thoại - 1 câu hỏi',
  dialogue_3: 'Nghe hội thoại - 3 câu hỏi',
  monologue_3: 'Nghe độc thoại - 3 câu hỏi',
}

const hideOptionText = (type: ListeningQuizType) =>
  type === 'picture_description' || type === 'choose_answer'

export function ListeningQuizStep({ audioUrl, title, questions, blockQuestionRange, onSubmit }: ListeningQuizStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length
  const total = questions.length

  const results = useMemo(() => {
    if (!submitted) return null
    return questions.map((q, i) => {
      const userAnswer = answers[q._id] || ''
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
      return { question: q, userAnswer, isCorrect, index: i }
    })
  }, [submitted, questions, answers])

  const score = results ? results.filter(r => r.isCorrect).length : 0
  const handleSelect = (quizId: string, option: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [quizId]: option }))
  }

  const handleSubmit = () => {
    if (!allAnswered || submitted) return
    setIsSubmitting(true)
    const correctCount = questions.filter(
      q => (answers[q._id] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()
    ).length
    setSubmitted(true)
    onSubmit({
      correct: correctCount,
      total,
      percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    })
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          Nghe audio và trả lời các câu hỏi. Chỉ được phát/tạm dừng, không tua.
        </p>
      </div>

      <AudioPlayerPauseOnly audioUrl={audioUrl} />

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {submitted ? `Kết quả: ${score}/${total}` : `${answeredCount}/${total} đã trả lời`}
          </span>
          {total > 12 && (
            <div className="h-2 flex-1 max-w-[120px] mx-4 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {blockQuestionRange && (
            <div className="pb-2 border-b border-gray-200">
              <span className="text-sm font-bold text-indigo-600">Câu {blockQuestionRange}</span>
            </div>
          )}
          {questions.map((q, qIndex) => {
            const userAnswer = answers[q._id]
            const result = results?.[qIndex]
            const noOptionText = hideOptionText(q.type)
            const noQuestion = q.type === 'choose_answer'
            const pictureOnly = q.type === 'picture_description'

            return (
              <div key={q._id} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${submitted && result
                    ? result.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    : userAnswer ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {submitted && result
                      ? result.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                      : blockQuestionRange ? `${qIndex + 1}` : `Q${qIndex + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    {!pictureOnly && !noQuestion && (
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {typeLabels[q.type]}
                      </span>
                    )}
                    {!noQuestion && q.question && (
                      <p className="text-sm font-medium text-gray-900 mt-1 leading-relaxed">{q.question}</p>
                    )}
                    {q.imageUrl && (
                      <div className={pictureOnly ? '' : 'mt-3'}>
                        <Image
                          src={q.imageUrl}
                          alt="Picture"
                          className="rounded-xl border border-gray-200 object-cover max-h-48 w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-11 space-y-2">
                  <div className={`grid gap-2 ${noOptionText ? 'grid-cols-2 sm:grid-cols-4' : 'space-y-2'}`}>
                    {q.options.map((opt, optIndex) => {
                      const isSelected = userAnswer === opt.text
                      const isCorrectAnswer = submitted && opt.text.trim().toLowerCase() === q.answer.trim().toLowerCase()
                      const isWrongSelected = submitted && isSelected && !isCorrectAnswer
                      const optLabel = String.fromCharCode(65 + optIndex)

                      let optClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all'
                      if (isSelected && !submitted) optClass = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      if (submitted) {
                        if (isCorrectAnswer) optClass = 'border-emerald-400 bg-emerald-50'
                        else if (isWrongSelected) optClass = 'border-red-400 bg-red-50'
                        else optClass = 'border-gray-100 opacity-60 cursor-default'
                      }

                      return (
                        <button
                          key={opt.text}
                          onClick={() => handleSelect(q._id, opt.text)}
                          disabled={submitted}
                          className={`text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all duration-200 ${optClass} ${noOptionText ? 'justify-center' : 'w-full'
                            }`}
                        >
                          <span className={`rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${noOptionText ? 'w-10 h-10 bg-gray-100 text-gray-700' : 'w-6 h-6 bg-gray-100 text-gray-600'
                            }`}>
                            {optLabel}
                          </span>
                          {!noOptionText && (
                            <>
                              {opt.imageUrl && (
                                <Image
                                  src={opt.imageUrl}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />
                              )}
                              <span className="flex-1 font-medium">{opt.text}</span>
                            </>
                          )}
                          {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {isWrongSelected && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!submitted && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${allAnswered
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/50'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ChevronRight className="w-5 h-5" />
              Nộp bài & Chuyển sang chép chính tả
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

