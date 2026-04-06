import { Input } from "@/components/ui/input";
import { IQuizResult } from "@/features/quizz/types";
import { FileText, PenTool } from "lucide-react";

interface FillInTheBlanksProps {
  question: string
  onChange: (value: string) => void
  quizzResult: IQuizResult
}

export default function FillInTheBlanks({ question, onChange, quizzResult }: FillInTheBlanksProps) {
  return (
    <div className="space-y-6">
      {/* Instruction Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-l-4 border-l-blue-500 shadow-md">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-bl-full" />
        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-md">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg">Đề bài:</span>
          </div>
          <span className="text-gray-700 dark:text-gray-300 text-base">Điền từ vào chỗ trống</span>
        </div>
      </div>

      {/* Question Section */}
      <div className="space-y-4 w-full">
        <div className="flex items-start gap-3 w-full">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md mt-1 flex-shrink-0">
            <PenTool className="w-4 h-4" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
              Complete: <span className="text-indigo-600 dark:text-indigo-400">&quot;{question}&quot;</span>
            </h2>
            <div className="relative w-full">
              <Input
                placeholder="Nhập câu trả lời của bạn"
                className="w-full p-4 h-12 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg shadow-sm focus:shadow-md transition-all bg-white dark:bg-gray-800"
                value={quizzResult.userAnswer}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
              />
              {quizzResult.userAnswer && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
