'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import IpaScoring from './IpaScoring'
import { saveHighestIpaScore } from '@/features/ipa/services/ipaApi'
import { IIpa, IIpaScoringResult } from '@/features/ipa/types'
import { useStudySession } from '@/libs/hooks/useStudySession'
import IpaLessonScore from './IpaLessonScore'
import ResultIpaQuiz from './ResultIpaQuiz'
import { PlayAudioButton } from '@/components/ui/play-audio-button'

interface QuizQuestion {
  word: string
  phonetic: string
  vietnamese: string
}

interface QuizResult {
  question: QuizQuestion
  result: IIpaScoringResult
  score: number
  audioBlob?: Blob
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
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null)

  const questions: QuizQuestion[] = ipa?.examples || []
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    startSession()
  }, [startSession])

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      const sumCurrentResult = currentResult?.phone_score_list?.reduce((sum, item) => sum + item.quality_score, 0) || 0
      const qualityScore = currentResult?.phone_score_list?.length || 1
      const avgScoreCurrentResult = sumCurrentResult / qualityScore

      const newCurrentResult = {
        question: currentQuestion,
        result: currentResult as IIpaScoringResult,
        score: avgScoreCurrentResult,
        audioBlob: currentAudioBlob || undefined,
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
      setCurrentAudioBlob(null)
      const prevResult = quizResults.find(r => r.question.word === currentQuestion.word)
      if (prevResult) {
        setCurrentResult(prevResult.result)
        setCurrentAudioBlob(prevResult.audioBlob || null)
      }
    } else {
      handleFinishQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setCurrentResult(null)
      setCurrentAudioBlob(null)
      const prevQuestion = questions[currentQuestionIndex - 1]
      const prevResult = quizResults.find(r => r.question.word === prevQuestion.word)
      if (prevResult) {
        setCurrentResult(prevResult.result)
        setCurrentAudioBlob(prevResult.audioBlob || null)
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
      score: avgScoreCurrentResult,
      audioBlob: currentAudioBlob || undefined,
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
    setCurrentAudioBlob(null)
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
    <>
      <Card className="max-w-6xl max-w-3xl mx-auto p-10">
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Câu {currentQuestionIndex + 1} / {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
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
              <PlayAudioButton
                text={currentQuestion.word}
                className="h-12 w-12 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-indigo-100/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col gap-4 items-center justify-center">
            {currentResult
              ? <>
                <IpaLessonScore phoneScoreList={currentResult} recordedAudioBlob={currentAudioBlob} />
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentResult(null)
                    setCurrentAudioBlob(null)
                  }}
                  className="border-slate-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Làm lại
                </Button>
              </>
              : <IpaScoring
                referenceText={currentQuestion.word}
                setResult={setCurrentResult}
                ipaId={ipa._id}
                onRecorded={setCurrentAudioBlob}
              />

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
    </>
  )
}
