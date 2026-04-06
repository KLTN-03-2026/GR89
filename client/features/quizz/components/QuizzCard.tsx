'use client'

import FillInTheBlanks from "./FillInTheBlanks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import MutipleChoice from "./MutipleChoice";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { IQuiz, IQuizResult } from "@/features/quizz/types";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

interface QuizzCardProps {
  questionNumber: number
  quizz: IQuiz
  quizzResult: IQuizResult
  handleNext: () => void
  handlePrevious: () => void
  onChange: (value: string) => void
  isLastQuestion: boolean
}

export default function QuizzCard({ questionNumber, quizz, quizzResult, handleNext, handlePrevious, isLastQuestion, onChange }: QuizzCardProps) {
  const isAnswered = quizzResult.userAnswer && quizzResult.userAnswer.trim() !== ""
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleNext])

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl mt-10 mx-5 overflow-hidden relative group">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            {questionNumber}
          </div>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Câu hỏi {questionNumber}</span>
        </div>
        <Badge
          variant={isAnswered ? "default" : "secondary"}
          className={`${isAnswered ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
        >
          {isAnswered ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Đã trả lời
            </>
          ) : (
            <>
              <Circle className="w-3 h-3 mr-1" />
              Chưa trả lời
            </>
          )}
        </Badge>
      </CardHeader>

      <CardContent className="pb-6">
        {
          quizz.type === "Fill in the blank" ?
            (<FillInTheBlanks
              question={quizz.question}
              onChange={onChange}
              quizzResult={quizzResult}
            />) :
            (
              <MutipleChoice
                question={quizz.question}
                options={quizz.options || []}
                onChange={onChange}
                quizzResult={quizzResult}
              />
            )
        }
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className={`${questionNumber === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'} transition-all`}
          onClick={handlePrevious}
          disabled={questionNumber === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Câu trước
        </Button>

        <Button
          className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          onClick={handleNext}
          ref={nextRef}
        >
          {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
