'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, HelpCircle, ChevronRight, RotateCcw, ListChecks } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IReading } from '@/types'
import { IQuizResultData } from '@/types/quiz'
import { ContentStateDisplay } from '@/components/common/ContentStateDisplay'
import ReadingPassage, { PassageFormat } from './ReadingPassage'
import QuizPanel from './QuizPanel'

interface ReadingExamProps {
  reading: IReading | null
  nextReadingId?: string | null
}

export default function ReadingExam({ reading, nextReadingId }: ReadingExamProps) {
  const router = useRouter()
  const [mobileTab, setMobileTab] = useState<'passage' | 'quiz'>('passage')
  const [quizKey, setQuizKey] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 })

  if (!reading) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy bài đọc"
        backUrl="/skills/reading"
        showBackButton
        variant="fullscreen"
      />
    )
  }

  if (!reading.quizzes || reading.quizzes.length === 0) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Bài đọc chưa có câu hỏi"
        backUrl="/skills/reading"
        showBackButton
        variant="fullscreen"
      />
    )
  }

  const handleSubmitQuiz = async (_results: IQuizResultData[]) => {
    const correct = _results.filter(r => r.isCorrect).length
    const total = _results.length
    setScore({ correct, total, percentage: Math.round((correct / total) * 100) })
    setIsCompleted(true)
  }

  const handleRetry = () => {
    setQuizKey(prev => prev + 1)
    setIsCompleted(false)
    setScore({ correct: 0, total: 0, percentage: 0 })
  }

  const handleGoBack = () => {
    router.push('/skills/reading')
  }

  const handleNextLesson = () => {
    if (nextReadingId) {
      router.push(`/skills/reading/lesson/${nextReadingId}`)
    }
  }

  const format: PassageFormat = (reading.type as PassageFormat) || detectPassageFormat(reading.title, reading.description)

  const passed = score.percentage >= 80

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Top bar */}
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 py-2.5 flex items-center gap-3 z-10">
        <button
          onClick={handleGoBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Trở về danh sách"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{reading.title}</h1>
          <p className="text-xs text-gray-500 truncate">{reading.description}</p>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <FormatBadge format={format} />
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            {reading.quizzes.length} câu hỏi
          </div>
        </div>
      </header>

      {/* Completion overlay */}
      {isCompleted && (
        <div className="shrink-0 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Score circle */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={passed ? '#22c55e' : score.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(score.percentage / 100) * 213.6} 213.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-bold ${passed ? 'text-green-600' : score.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {score.percentage}%
                  </span>
                </div>
              </div>

              {/* Score text */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {passed ? 'Xuất sắc!' : score.percentage >= 50 ? 'Khá tốt!' : 'Cố gắng thêm!'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Bạn trả lời đúng {score.correct}/{score.total} câu hỏi
                  {passed && ' — Đạt yêu cầu hoàn thành'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại
                </button>
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ListChecks className="w-4 h-4" />
                  Danh sách
                </button>
                {nextReadingId && (
                  <button
                    onClick={handleNextLesson}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Bài tiếp
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile tab switcher */}
      <div className="md:hidden shrink-0 bg-white border-b border-gray-200 grid grid-cols-2">
        <button
          onClick={() => setMobileTab('passage')}
          className={`py-2.5 text-xs font-medium transition-colors relative ${mobileTab === 'passage' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Bài đọc
          </div>
          {mobileTab === 'passage' && <div className="absolute bottom-0 inset-x-1/4 h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button
          onClick={() => setMobileTab('quiz')}
          className={`py-2.5 text-xs font-medium transition-colors relative ${mobileTab === 'quiz' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Câu hỏi
          </div>
          {mobileTab === 'quiz' && <div className="absolute bottom-0 inset-x-1/4 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 min-h-0 p-3 sm:p-4">
        {/* Desktop: side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 h-full">
          <ReadingPassage
            title={reading.title}
            description={reading.description}
            content={reading.paragraphEn}
            format={format}
            image={reading.image ? { url: reading.image.url, width: reading.image.width, height: reading.image.height } : undefined}
          />
          <QuizPanel
            key={quizKey}
            quizzes={reading.quizzes}
            onSubmit={handleSubmitQuiz}
          />
        </div>

        {/* Mobile: tabbed */}
        <div className="md:hidden h-full">
          {mobileTab === 'passage' ? (
            <ReadingPassage
              title={reading.title}
              description={reading.description}
              content={reading.paragraphEn}
              format={format}
              image={reading.image ? { url: reading.image.url, width: reading.image.width, height: reading.image.height } : undefined}
            />
          ) : (
            <QuizPanel
              key={quizKey}
              quizzes={reading.quizzes}
              onSubmit={handleSubmitQuiz}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const formatLabels: Record<PassageFormat, { label: string; color: string }> = {
  email: { label: 'Email', color: 'bg-blue-100 text-blue-700' },
  notice: { label: 'Notice', color: 'bg-amber-100 text-amber-700' },
  advertisement: { label: 'Ads', color: 'bg-rose-100 text-rose-700' },
  article: { label: 'Article', color: 'bg-gray-100 text-gray-700' },
  memo: { label: 'Memo', color: 'bg-emerald-100 text-emerald-700' },
  form: { label: 'Form', color: 'bg-violet-100 text-violet-700' },
}

function FormatBadge({ format }: { format: PassageFormat }) {
  const cfg = formatLabels[format]
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function detectPassageFormat(title: string, description: string): PassageFormat {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('email') || text.includes('mail') || text.includes('inbox')) return 'email'
  if (text.includes('notice') || text.includes('announcement') || text.includes('thông báo')) return 'notice'
  if (text.includes('advertisement') || text.includes('advert') || text.includes('sale') || text.includes('promotion')) return 'advertisement'
  if (text.includes('memo') || text.includes('memorandum') || text.includes('internal')) return 'memo'
  if (text.includes('form') || text.includes('document') || text.includes('application')) return 'form'
  return 'article'
}
