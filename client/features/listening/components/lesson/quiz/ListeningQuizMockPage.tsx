'use client'

import { useMemo, useState } from 'react'
import { AudioSection } from '@/components/common/medias'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Headphones, XCircle } from 'lucide-react'

type MockQuestion = {
  id: string
  question: string
  options: string[]
  answer: string
}

const MOCK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    question: 'Đoạn nghe chủ yếu nói về chủ đề nào?',
    options: ['Du lịch', 'Giáo dục', 'Ẩm thực', 'Thể thao'],
    answer: 'Giáo dục',
  },
  {
    id: 'q2',
    question: 'Mục đích chính của người nói là gì?',
    options: ['Thuyết phục', 'Than phiền', 'Thông báo', 'Hỏi ý kiến'],
    answer: 'Thông báo',
  },
  {
    id: 'q3',
    question: 'Bối cảnh của đoạn hội thoại có khả năng ở đâu nhất?',
    options: ['Thư viện', 'Sân bay', 'Lớp học', 'Nhà hàng'],
    answer: 'Lớp học',
  },
]

export function ListeningQuizMockPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const total = MOCK_QUESTIONS.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === total

  const score = useMemo(() => {
    return MOCK_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0)
  }, [answers])

  const percent = total > 0 ? Math.round((score / total) * 100) : 0

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-t-xl">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Headphones className="w-6 h-6" />
            Listening Quiz (Mock)
          </CardTitle>
          <p className="text-indigo-100 text-sm">
            Giao diện mẫu cho bước "Nghe và trả lời câu hỏi ý chính" trước khi chép chính tả.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <AudioSection audioUrl={MOCK_AUDIO_URL} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          {MOCK_QUESTIONS.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">
                Câu {idx + 1}. {q.question}
              </p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt
                  const isCorrect = submitted && opt === q.answer
                  const isWrongSelected = submitted && selected && opt !== q.answer
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${selected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'} ${submitted ? 'cursor-default' : ''}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isWrongSelected ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        {opt}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-600">
              {submitted ? `Kết quả: ${score}/${total} (${percent}%)` : `Đã trả lời: ${answeredCount}/${total}`}
            </p>
            <div className="flex items-center gap-2">
              {submitted ? (
                <Button variant="outline" onClick={handleRetry}>Làm lại</Button>
              ) : (
                <Button onClick={() => setSubmitted(true)} disabled={!allAnswered}>
                  Nộp bài
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

