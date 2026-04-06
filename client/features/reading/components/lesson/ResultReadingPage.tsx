'use client'
import { getTime } from "@/libs/utils"
import type { IReadingResult } from "@/features/reading/types"
import Link from "next/link"
import { ContentStateDisplay, ContentStateType } from "@/components/common/ContentStateDisplay"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, Award, Target, Brain } from "lucide-react"

interface ResultReadingPageProps {
  result: IReadingResult
  error?: { type: ContentStateType, message?: string } | null
}

export function ResultReadingPage({ result, error }: ResultReadingPageProps) {
  if (error) {
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl="/skills/reading"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!result) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy kết quả"
        backUrl="/skills/reading"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  const { correctAnswers, totalQuestions, progress, duration, weakPoints, result: quizResults } = result

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kết quả luyện đọc</h1>
          <p className="text-muted-foreground mt-1">Hoàn thành vào {new Date(result.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <Link 
          href="/skills/reading" 
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Target size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Đúng/Tổng</span>
            </div>
            <div className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <Award size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Chính xác</span>
            </div>
            <div className="text-2xl font-bold">{progress}%</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
              <Clock size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Thời gian</span>
            </div>
            <div className="text-2xl font-bold">{getTime(duration)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <Brain size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Cấp độ</span>
            </div>
            <div className="text-2xl font-bold">{result.level}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Questions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Chi tiết câu trả lời
          </h2>
          
          <div className="space-y-4">
            {quizResults?.map((q, idx) => (
              <Card key={q._id} className={`border-l-4 ${q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-medium leading-relaxed">
                      Câu {q.questionNumber}: {q.question}
                    </CardTitle>
                    {q.isCorrect ? (
                      <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                    ) : (
                      <XCircle className="text-red-500 shrink-0" size={20} />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium w-32">Câu trả lời của bạn:</span>
                    <span className={q.isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : q.userAnswer || '(Trống)'}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium w-32">Đáp án đúng:</span>
                      <span className="text-green-600 font-semibold">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar: Weak Points & Next Steps */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="text-purple-500" size={20} />
                Điểm cần lưu ý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weakPoints && weakPoints.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weakPoints.map((point, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                      {point}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Tuyệt vời! Bạn không có điểm yếu nào đáng kể trong bài học này.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Lời khuyên từ AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {progress >= 80 
                  ? "Bạn đã nắm vững nội dung bài đọc này. Hãy thử sức với các bài đọc ở cấp độ cao hơn để mở rộng vốn từ vựng và cải thiện kỹ năng đọc hiểu."
                  : "Bạn nên xem lại các câu trả lời sai và tra cứu nghĩa của các từ mới trong bài đọc. Luyện tập thêm với các bài cùng chủ đề sẽ giúp bạn tiến bộ nhanh hơn."}
              </p>
              <Link 
                href="/skills/reading"
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Tiếp tục học
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
