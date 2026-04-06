'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Volume2,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'react-toastify'
import IpaScoring from './IpaScoring'
import { saveHighestIpaScore } from '@/features/ipa/services/ipaApi'
import { IIpa, IIpaScoringResult } from '@/types'
import { useStudySession } from '@/libs/hooks/useStudySession'
import IpaLessonScore from './IpaLessonScore'
import ResultIpaQuiz from './ResultIpaQuiz'

interface QuizQuestion {
  word: string
  phonetic: string
  vietnamese: string
}

interface QuizResult {
  question: QuizQuestion
  result: IIpaScoringResult
  score: number
}

interface QuizzIPAProps {
  ipa: IIpa
}

export function QuizzIPA({ ipa }: QuizzIPAProps) {
  const { startSession, getSessionPayload } = useStudySession()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [currentResult, setCurrentResult] = useState<IIpaScoringResult | null>(null)

  const questions: QuizQuestion[] = ipa?.examples || []
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    startSession()
  }, [startSession])

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onerror = () => {
        toast.error('Không thể phát audio')
      }

      speechSynthesis.speak(utterance)
    } else {
      toast.error('Trình duyệt không hỗ trợ phát âm')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      const sumCurrentResult = currentResult?.phone_score_list?.reduce((sum, item) => sum + item.quality_score, 0) || 0
      const qualityScore = currentResult?.phone_score_list?.length || 1
      const avgScoreCurrentResult = sumCurrentResult / qualityScore

      const newCurrentResult = {
        question: currentQuestion,
        result: currentResult as IIpaScoringResult,
        score: avgScoreCurrentResult
      }
      if (quizResults.length > currentQuestionIndex) {
        setQuizResults(prev => {
          const newQuizResults = [...prev]
          newQuizResults[currentQuestionIndex] = newCurrentResult as unknown as QuizResult
          return newQuizResults
        })
      } else {
        setQuizResults(prev => [...prev, newCurrentResult as unknown as QuizResult])
      }

      setCurrentResult(null)
      const prevResult = quizResults.find(r => r.question.word === currentQuestion.word)
      if (prevResult) {
        setCurrentResult(prevResult.result)
      }
    } else {
      handleFinishQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setCurrentResult(null)
      const prevQuestion = questions[currentQuestionIndex - 1]
      const prevResult = quizResults.find(r => r.question.word === prevQuestion.word)
      if (prevResult) {
        setCurrentResult(prevResult.result)
      }
    }
  }

  const handleFinishQuiz = async () => {
    const sumCurrentResult = currentResult?.phone_score_list?.reduce((sum, item) => sum + item.quality_score, 0) || 0
    const qualityScore = currentResult?.phone_score_list?.length || 1
    const avgScoreCurrentResult = sumCurrentResult / qualityScore
    const newCurrentResult = {
      question: currentQuestion,
      result: currentResult as IIpaScoringResult,
      score: avgScoreCurrentResult
    }

    setQuizResults(prev => [...prev, newCurrentResult as unknown as QuizResult])

    const scoreAvg = quizResults.reduce((sum, qr) => sum + qr.score, 0) / quizResults.length
    setShowResults(true)
    const studySession = getSessionPayload()
    await saveHighestIpaScore(ipa._id, scoreAvg, studySession)
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setQuizResults([])
    setShowResults(false)
    setCurrentResult(null)
    startSession()
  }

  if (showResults) {
    return (
      <ResultIpaQuiz results={quizResults} onRetry={handleRetry} />
    )
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Không có câu hỏi nào</p>
        </CardContent>
      </Card>
    )
  }

  const formatPhonetic = (value: string) => {
    if (!value) return ''
    const trimmed = value.replace(/^\/|\/$/g, '').trim()
    return `/${trimmed}/`
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Câu {currentQuestionIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Focus Card */}
      <Card className="border border-slate-200 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center text-center gap-3">
            <CardTitle className="text-5xl font-extrabold text-slate-900 tracking-tight">
              {currentQuestion.word}
            </CardTitle>
            <div className="text-2xl font-semibold text-slate-700">
              {formatPhonetic(currentQuestion.phonetic)}
            </div>
            <p className="text-slate-600 text-base">{currentQuestion.vietnamese}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => playAudio(currentQuestion.word)}
                className="h-12 w-12 border-slate-300 hover:border-slate-400"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col gap-4 items-center justify-center">
            {currentResult
              ? <>
                <IpaLessonScore phoneScoreList={currentResult} />
                <Button
                  variant="outline"
                  onClick={() => setCurrentResult(null)}
                  className="border-slate-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Làm lại
                </Button>
              </>
              : <IpaScoring referenceText={currentQuestion.word} setResult={setCurrentResult} />

            }
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Câu trước
            </Button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={currentResult === null}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Câu tiếp theo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinishQuiz}
                disabled={currentResult === null}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Hoàn thành
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
