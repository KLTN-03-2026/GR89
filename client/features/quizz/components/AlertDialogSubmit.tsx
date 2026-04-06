import {
  AlertDialog, AlertDialogAction, AlertDialogHeader,
  AlertDialogContent, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { IQuizResult, IQuiz } from '@/features/quizz'
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react'

interface AlertDialogSubmitProps {
  showConfirm: boolean
  setShowConfirm: (show: boolean) => void
  quizResults: IQuizResult[]
  quizzes: IQuiz[]
  handleSubmit: () => void
}

export default function AlertDialogSubmit({
  showConfirm, setShowConfirm, quizResults, quizzes, handleSubmit
}: AlertDialogSubmitProps) {
  const answered = quizResults.filter(r => r.userAnswer.trim() !== '').length
  const unanswered = quizzes.length - answered
  const allAnswered = unanswered === 0
  const percent = Math.round((answered / quizzes.length) * 100)

  return (
    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent className="bg-white border-0 shadow-2xl max-w-md p-0 overflow-hidden">
        {/* Header có màu */}
        <div className={`px-6 pt-6 pb-4 text-center ${allAnswered
          ? 'bg-gradient-to-br from-green-50 to-emerald-50'
          : 'bg-gradient-to-br from-orange-50 to-amber-50'
          }`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${allAnswered
            ? 'bg-green-100 text-green-600'
            : 'bg-orange-100 text-orange-600'
            }`}>
            {allAnswered
              ? <CheckCircle2 className="w-8 h-8" />
              : <AlertTriangle className="w-8 h-8" />
            }
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {allAnswered ? 'Sẵn sàng nộp bài!' : 'Còn câu chưa trả lời!'}
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>

        {/* Nội dung */}
        <div className="px-6 py-5 space-y-4">
          {/* Progress ring */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={allAnswered ? '#22c55e' : '#f97316'}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${percent * 1.508} 150.8`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                {percent}%
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                Đã trả lời {answered}/{quizzes.length} câu
              </p>
              {!allAnswered && (
                <p className="text-sm text-orange-500 font-medium mt-0.5">
                  Còn {unanswered} câu chưa trả lời
                </p>
              )}
            </div>
          </div>

          <AlertDialogDescription className="text-sm text-gray-500 text-center">
            {allAnswered
              ? 'Bạn đã hoàn thành tất cả câu hỏi. Nhấn nộp bài để xem kết quả.'
              : 'Bạn vẫn có thể nộp bài, nhưng các câu chưa trả lời sẽ tính là sai.'
            }
          </AlertDialogDescription>
        </div>

        {/* Nút bấm */}
        <AlertDialogFooter className="px-6 pb-6 pt-0 gap-3 sm:gap-3">
          <AlertDialogCancel className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold">
            Quay lại
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Send className="w-4 h-4 mr-2" />
            Nộp bài
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}