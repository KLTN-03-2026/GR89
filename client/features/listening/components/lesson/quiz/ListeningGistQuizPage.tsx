'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AudioSection } from '@/components/common/medias'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { IListening } from '@/features/listening/types'
import { CheckCircle2, ChevronRight, Headphones, HelpCircle, Lightbulb, XCircle } from 'lucide-react'
import { doListeningQuiz } from '@/features/listening/services/listeningApi'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { toast } from 'react-toastify'

type QuizItem = { question: string; options: string[]; answer: string }

const fallbackMock: QuizItem[] = [
  {
    question: 'Đoạn nghe chủ yếu nói về chủ đề nào?',
    options: ['Du lịch', 'Giáo dục', 'Ẩm thực', 'Thể thao'],
    answer: 'Giáo dục',
  },
  {
    question: 'Mục đích chính của người nói là gì?',
    options: ['Thuyết phục', 'Than phiền', 'Thông báo', 'Hỏi ý kiến'],
    answer: 'Thông báo',
  },
  {
    question: 'Bối cảnh của đoạn hội thoại có khả năng ở đâu nhất?',
    options: ['Thư viện', 'Sân bay', 'Lớp học', 'Nhà hàng'],
    answer: 'Lớp học',
  },
]

export function ListeningGistQuizPage({ listening }: { listening: IListening }) {
  const questions: QuizItem[] = Array.isArray(listening.quiz) && listening.quiz.length > 0 ? listening.quiz : fallbackMock

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { startSession, getSessionPayload } = useStudySession()

  const total = questions.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === total

  const score = useMemo(() => {
    return questions.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0)
  }, [answers, questions])

  const percent = total > 0 ? Math.round((score / total) * 100) : 0

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    startSession()
  }

  const handleSubmit = async () => {
    if (!allAnswered || submitted || isSaving) return

    setIsSaving(true)
    try {
      const quizResultPayload = questions.map((q, idx) => ({
        index: idx,
        text: answers[idx] || '',
        isCorrect: (answers[idx] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()
      }))

      await doListeningQuiz(
        listening._id,
        0,
        quizResultPayload,
        getSessionPayload(),
        'quiz'
      )
      setSubmitted(true)
    } catch {
      toast.error('Không thể lưu kết quả quiz. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-indigo-100/80 pt-0 shadow-[0_12px_32px_rgba(99,102,241,0.10)] overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-indigo-100 text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full">
                <Headphones className="w-4 h-4" />
                Lượt 1 · Nghe hiểu ý chính
              </div>
              <h1 className="mt-2 text-[30px] leading-tight font-extrabold tracking-tight truncate">
                {listening.title}
              </h1>
              <p className="text-indigo-100/95 mt-1.5 text-sm leading-relaxed line-clamp-2">
                {listening.description}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/25"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Gợi ý cách học
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Cách học Listening hiệu quả</DialogTitle>
                  <DialogDescription>
                    Làm theo 3 bước sau để nghe hiểu tốt hơn và ghi nhớ nội dung nhanh hơn.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Bước 1:</strong> Đọc trước câu hỏi để hiểu yêu cầu và xác định thông tin cần nghe.</p>
                  <p><strong>Bước 2:</strong> Nghe trọn vẹn một lần để nắm ý chính, không tạm dừng và không tua lại, sau đó chọn đáp án trắc nghiệm.</p>
                  <p><strong>Bước 3:</strong> Nộp bài, chuyển sang phần nghe chép chính tả và xem lại lý do vì sao mình chọn sai để rút kinh nghiệm.</p>
                  <p className="text-gray-500">
                    Mẹo: Khi phân vân, hãy ưu tiên đáp án bám sát ý chính của toàn bộ đoạn hội thoại.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 bg-white">
          <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Nghe audio và trả lời 2–3 câu hỏi để nắm ý chính trước khi sang chép chính tả.
          </p>
          <div className="rounded-xl border border-indigo-100 p-3 shadow-sm bg-gradient-to-br from-white to-indigo-50/40">
            <AudioSection audioUrl={listening.audio || ''} />
          </div>
        </CardContent>
      </Card>

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
              const userAnswer = answers[idx]
              const isCorrect = submitted && userAnswer === q.answer

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
                          onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [idx]: opt }))}
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
                disabled={!allAnswered || isSaving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/40 rounded-lg"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                {isSaving ? 'Đang lưu...' : 'Nộp bài'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRetry} className="rounded-lg">
                  Làm lại
                </Button>
                <Link href={`/skills/listening/${listening._id}`} className="inline-flex">
                  <Button className="rounded-lg">
                    Sang chép chính tả
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

