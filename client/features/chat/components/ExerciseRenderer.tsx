'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Send } from 'lucide-react'
import type { Exercise, ExerciseResult, QuestionResult } from '../types'

interface ExerciseRendererProps {
  exercise: Exercise
  onComplete?: (result: ExerciseResult) => void
}

export function ExerciseRenderer({ exercise, onComplete }: ExerciseRendererProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }, [])

  const gradeExercise = useCallback(() => {
    const results: QuestionResult[] = []
    let correctCount = 0

    exercise.questions.forEach((question) => {
      const userAnswer = (answers[question.id] || '').trim().toLowerCase()
      let isCorrect = false
      let correctAnswer = ''

      if (question.type === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect)
        correctAnswer = correctOption?.value || ''
        isCorrect = userAnswer === correctOption?.value.toLowerCase()
      } else if (question.type === 'fill-blank' || question.type === 'translation') {
        const acceptableAnswers = question.correctAnswers.map(a => a.trim().toLowerCase())
        isCorrect = acceptableAnswers.includes(userAnswer)
        correctAnswer = question.correctAnswers.join(' hoặc ')
      }

      if (isCorrect) correctCount++

      results.push({
        questionId: question.id,
        isCorrect,
        userAnswer: userAnswer || 'Chưa trả lời',
        correctAnswer,
        explanation: question.explanation
      })
    })

    const exerciseResult: ExerciseResult = {
      exerciseId: exercise.id,
      totalQuestions: exercise.questions.length,
      correctAnswers: correctCount,
      percentage: Math.round((correctCount / exercise.questions.length) * 100),
      results
    }

    setResult(exerciseResult)
    setIsSubmitted(true)
    onComplete?.(exerciseResult)
  }, [answers, exercise, onComplete])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (percentage >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-sm">
      {exercise.title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{exercise.title}</h3>
        </div>
      )}

      <div className="p-4 space-y-6">
        {exercise.questions.map((question, index) => (
          <div
            key={question.id}
            className="space-y-3 p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {question.question}
              </p>
            </div>

            {question.type === 'multiple-choice' && (
              <div className="ml-8 space-y-2">
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.id] === option.value
                  const showResult = isSubmitted && result
                  const isCorrectOption = option.isCorrect
                  const isWrongSelection = showResult && isSelected && !isCorrectOption

                  return (
                    <label
                      key={optIndex}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      } ${
                        showResult && isCorrectOption
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : ''
                      } ${
                        isWrongSelection
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={isSubmitted}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                        {option.label}
                      </span>
                      {showResult && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      {isWrongSelection && (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                    </label>
                  )
                })}
              </div>
            )}

            {(question.type === 'fill-blank' || question.type === 'translation') && (
              <div className="ml-8">
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={isSubmitted}
                  placeholder={question.type === 'translation' ? 'Nhập bản dịch...' : 'Điền từ vào đây...'}
                  className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg transition-all ${
                    isSubmitted && result
                      ? result.results.find(r => r.questionId === question.id)?.isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  } disabled:cursor-not-allowed`}
                />
              </div>
            )}

            {isSubmitted && result && (
              <div className={`ml-8 p-3 rounded-lg border ${
                result.results.find(r => r.questionId === question.id)?.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {result.results.find(r => r.questionId === question.id)?.explanation}
                </p>
              </div>
            )}
          </div>
        ))}

        {result && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${getScoreBgColor(result.percentage)}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Kết quả</h4>
              <span className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Bạn đã trả lời đúng <strong className={getScoreColor(result.percentage)}>
                {result.correctAnswers}/{result.totalQuestions}
              </strong> câu hỏi
            </div>
          </div>
        )}

        {!isSubmitted && (
          <button
            onClick={gradeExercise}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Nộp bài
          </button>
        )}
      </div>
    </div>
  )
}
