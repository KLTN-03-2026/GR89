'use client'
import { useState, useEffect } from "react"
import SummaryResults from "./SummaryResults"
import QuizzCard from "./QuizzCard"
import { ProgessBar } from "./ProgessBar"
import { IQuizResultData, IQuizResult, IQuiz } from "@/features/quizz/types"
import { doGrammarQuiz, doReadingQuiz, doVocabularyQuiz } from '@/features/quizz/services/quizzApi'
import { HeaderQuizzLayout } from "@/components/common/layout"
import { ContentStateDisplay } from "@/components/common/ContentStateDisplay"
import { useStudySession } from "@/libs/hooks/useStudySession"
import AlertDialogSubmit from "./AlertDialogSubmit"

interface IQuizzCardProps {
  _id: string
  type: 'vocabulary' | 'reading' | 'grammar'
  quizzes: IQuiz[]
}

export function Quizz({ _id, type, quizzes }: IQuizzCardProps) {
  const [results, setResults] = useState<IQuizResult[]>([])
  const [quizResults, setQuizResults] = useState<IQuizResultData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFinished, setIsFinished] = useState<boolean>(false)
  const { startSession, getSessionPayload } = useStudySession()
  const [showConfirm, setShowConfirm] = useState(false)

  const normalizeAnswer = (value: string) =>
    String(value || '')
      .normalize('NFC')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()

  useEffect(() => {
    startSession()
    // Initialize results based on quizzes
    if (quizzes.length > 0) {
      setResults(quizzes.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question,
        userAnswer: "",
        correctAnswer: q.answer,
        explanation: q.explanation
      })))
      setQuizResults(quizzes.map((q, index) => ({
        questionNumber: index + 1,
        userAnswer: "",
        quizId: q._id,
        isCorrect: false
      })))
    }
  }, [quizzes, startSession])

  const [questionNumber, setQuestionNumber] = useState<number>(1)

  const handleSubmit = async () => {
    setIsLoading(true)
    setIsFinished(true)
    const studySession = getSessionPayload()
    switch (type) {
      case 'vocabulary':
        await doVocabularyQuiz(_id, quizResults, studySession)
        break
      case 'grammar':
        await doGrammarQuiz(_id, quizResults, studySession)
        break
      case 'reading':
        await doReadingQuiz(_id, quizResults, studySession)
        break
    }
  }

  const handleNext = async () => {
    if (questionNumber + 1 === quizzes.length + 1) {
      setShowConfirm(true)
      return
    }
    setIsLoading(false)

    setQuestionNumber(prev => prev + 1)
  }

  const handlePrevious = () => {
    if (questionNumber > 1) {
      setQuestionNumber(prev => prev - 1)
    }
  }

  const onRetry = () => {
    startSession()
    setQuestionNumber(1)
    setIsFinished(false)
    setResults(quizzes.map((quizz, index) => {
      return {
        questionNumber: index + 1,
        question: quizz.question,
        userAnswer: "",
        correctAnswer: quizz.answer,
        explanation: quizz.explanation
      }
    }))
    setQuizResults(quizzes.map((quizz, index) => ({
      questionNumber: index + 1,
      userAnswer: "",
      quizId: quizz._id,
      isCorrect: false
    })))
    setIsLoading(false)
  }

  const onChange = (value: string) => {
    const normalizedUserAnswer = normalizeAnswer(value)
    const normalizedCorrectAnswer = normalizeAnswer(quizzes[questionNumber - 1]?.answer || '')

    setResults(prev => {
      const newResults = [...prev]
      newResults[questionNumber - 1].userAnswer = value
      return newResults
    })
    setQuizResults(prev => {
      const newQuizResults = [...prev]
      newQuizResults[questionNumber - 1].isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
      newQuizResults[questionNumber - 1].userAnswer = normalizedUserAnswer
      return newQuizResults
    })
  }

  if (isFinished) return <div className="m-auto mt-5 h-full p-5 max-w-4xl overflow-auto">
    <SummaryResults
      onRetry={onRetry}
      results={results}
      type={type}
    />
  </div>

  if (results.length !== quizzes.length || isLoading || isFinished) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (quizzes.length === 0) {
    const backUrl = type === 'vocabulary' ? '/study/vocabulary' : type === 'grammar' ? '/study/grammar' : '/skills/reading'
    return (
      <ContentStateDisplay
        type="empty"
        message="Không có dữ liệu quiz"
        backUrl={backUrl}
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <>
      <HeaderQuizzLayout
        question={quizzes.length}
        finished={() => setIsFinished(true)}
        questionNumber={questionNumber}
      />
      <div className="h-[calc(100vh-6rem)]">
        <ProgessBar progress={questionNumber / quizzes.length * 100} />
        <div className="mx-auto p-5 max-w-4xl overflow-auto">
          {
            questionNumber < quizzes.length + 1 &&
            <QuizzCard
              questionNumber={questionNumber}
              quizz={quizzes[questionNumber - 1]}
              quizzResult={results[questionNumber - 1]}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              isLastQuestion={questionNumber === quizzes.length}
              onChange={onChange}
            />
          }
        </div>
      </div>

      {
        showConfirm && <AlertDialogSubmit
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          quizResults={results}
          quizzes={quizzes}
          handleSubmit={handleSubmit}
        />
      }
    </>
  )
}
