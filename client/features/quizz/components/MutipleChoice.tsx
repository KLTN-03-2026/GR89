import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IQuizResult } from "@/features/quizz/types";
import { FileText, CheckCircle2 } from "lucide-react";

interface MutipleChoiceProps {
  question: string
  options: string[]
  onChange: (value: string) => void
  quizzResult: IQuizResult
}

export default function MutipleChoice({ question, options, onChange, quizzResult }: MutipleChoiceProps) {
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
          <span className="text-gray-700 dark:text-gray-300 text-base">Lựa chọn câu trả lời chính xác</span>
        </div>
      </div>

      {/* Question Section */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
          {question}
        </h2>

        <RadioGroup
          value={quizzResult.userAnswer}
          onValueChange={(value) => onChange(value)}
          className="space-y-3"
        >
          {options.length >= 2 && options.map((option, index) => {
            const isSelected = quizzResult.userAnswer === option
            return (
              <div
                key={option}
                className={`relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer group ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm'
                  }`}
                onClick={() => onChange(option)}
              >
                <RadioGroupItem
                  className="border-indigo-500"
                  value={option}
                  id={option}
                />
                <Label
                  htmlFor={option}
                  className={`text-base w-full cursor-pointer flex items-center justify-between ${isSelected
                      ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  <span>{option}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  )}
                </Label>
                {/* Option number badge */}
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {String.fromCharCode(65 + index)}
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </div>
    </div>
  )
}
