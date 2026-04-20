import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IQuiz } from '@/features/quizz'
import { IQuizResultData } from '@/features/quizz/types'
import { CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import React, { useState } from 'react'

interface Props {
  questions: IQuiz[]
  onComplete: (page: 'dictation' | 'quiz') => void
  formDataQuizResult: IQuizResultData[]
  setFormDataQuizResult: React.Dispatch<React.SetStateAction<IQuizResultData[]>>
}

export default function ListeningQuizShow({ questions, onComplete, formDataQuizResult, setFormDataQuizResult }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const handleRetry = () => {
    setSubmitted(false)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleSelectAnswer = (idx: number, answer: string, isCorrect: boolean) => {
    setFormDataQuizResult(prev =>
      prev.map((item: IQuizResultData, index: number) => {
        return index === idx
          ? { ...item, userAnswer: answer, isCorrect: isCorrect }
          : item
      })
    )
  }

  const total = questions.length
  const score = formDataQuizResult.filter(item => item.isCorrect).length
  const percent = total > 0 ? Math.round((score / total) * 100) : 0
  const answeredCount = formDataQuizResult.filter(item => item.userAnswer !== '').length

  return (
    <Card className="shadow-sm border border-gray-200/80 overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-700">
            {submitted ? `Kết quả: ${score}/${total} (${percent}%)` : `Tiến độ: ${answeredCount}/${total}`}
          </span>
          <div className="h-2.5 w-44 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {questions.map((q, idx) => {
            const userAnswer = formDataQuizResult[idx].userAnswer
            const isCorrect = formDataQuizResult[idx].isCorrect

            return (
              <div key={idx} className="rounded-xl border border-gray-200 p-5 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${submitted
                      ? isCorrect
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                      : userAnswer
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-gray-900 leading-relaxed">{q.question}</p>
                    {submitted && (
                      <p className="mt-1 text-xs text-gray-500">
                        Đáp án đúng: <span className="font-semibold text-gray-700">{q.answer}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {q.options.map((opt) => {
                    const selected = userAnswer === opt
                    const showCorrect = submitted && opt === q.answer
                    const showWrongSelected = submitted && selected && opt !== q.answer

                    let cls = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                    if (!submitted && selected) cls = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    if (submitted) {
                      if (showCorrect) cls = 'border-emerald-300 bg-emerald-50'
                      else if (showWrongSelected) cls = 'border-rose-300 bg-rose-50'
                      else cls = 'border-gray-100 opacity-70'
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => !submitted && handleSelectAnswer(idx, opt, opt === q.answer)}
                        disabled={submitted}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${cls}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {showCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : showWrongSelected ? (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? 'border-indigo-500' : 'border-gray-300'
                                }`}
                            >
                              {selected && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                            </span>
                          )}
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/40 rounded-lg"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              {/* {isSaving ? 'Đang lưu...' : 'Nộp bài'} */}
              Nộp bài
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRetry} className="rounded-lg">
                Làm lại
              </Button>

              <Button className="rounded-lg" onClick={() => onComplete('dictation')}>
                Sang chép chính tả
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
