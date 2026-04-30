'use client'
import { useEffect, useState } from 'react'
import { ListeningLesson } from './dictation/ListeningLesson'
import { IListening, IListeningProgress } from '../../types'
import { ListeningGistQuizPage } from './quiz/ListeningGistQuizPage'
import { IQuizResultData } from '@/features/quizz/types'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { doListeningQuiz } from '../../services/listeningApi'
import { ResultListening } from './result/ResultListeningPage'
import { toast } from 'react-toastify'

interface props {
  listening: IListening
}

export function ListeningLessonPage({ listening }: props) {
  const { startSession, getSessionPayload } = useStudySession()

  const [currenPage, setCurrenPage] = useState<'dictation' | 'quiz' | 'result'>('quiz')
  const [formDataQuizResult, setFormDataQuizResult] = useState<IQuizResultData[]>(
    (listening.quizzes || []).map((quiz, index) => ({
      questionNumber: index + 1,
      userAnswer: '',
      quizId: quiz._id,
      isCorrect: false,
    }))
  )

  const [formDataDictationResult, setFormDataDictationResult] = useState<{
    value: string
    added?: boolean
    removed?: boolean
  }[]>([])

  useEffect(() => {
    startSession()
  }, [startSession])

  const handleChangePage = (page: 'dictation' | 'quiz') => {
    setCurrenPage(page)
  }

  const handleSubmit = async () => {
    const studySession = getSessionPayload()
    await doListeningQuiz(listening._id, formDataDictationResult, formDataQuizResult, studySession)
      .then(() => {
        toast.success('Chúc mừng bạn đã hoàn thành bài nghe')
        setCurrenPage('result')
      })
  }

  const onRetry = () => {
    setCurrenPage('quiz')
    setFormDataQuizResult(
      (listening.quizzes || []).map((quiz, index) => ({
        questionNumber: index + 1,
        userAnswer: '',
        quizId: quiz._id,
        isCorrect: false,
      }))
    )
    setFormDataDictationResult([])
  }

  if (currenPage === 'dictation') {
    return (
      <ListeningLesson
        listening={listening}
        formDataDictationResult={formDataDictationResult}
        setFormDataDictationResult={setFormDataDictationResult}
        handleSubmit={handleSubmit}
        onRetry={onRetry}
      />
    )
  }

  if (currenPage === 'quiz') {
    return <ListeningGistQuizPage
      listening={listening}
      onComplete={handleChangePage}
      setFormDataQuizResult={setFormDataQuizResult as React.Dispatch<React.SetStateAction<IQuizResultData[]>>}
      formDataQuizResult={formDataQuizResult}
    />
  }

  const correctQuiz = formDataQuizResult.filter(r => r.isCorrect).length

  const correctDictation = formDataDictationResult.reduce((acc, part) => {
    if (!part?.added && !part?.removed) {
      return acc + (part?.value || '').trim().split(/[ \t\n]+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const totalDictation = formDataDictationResult.reduce((acc, part) => {
    if (!part?.added) {
      return acc + (part?.value || '').trim().split(/[ \t\n]+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const quizPercent = formDataQuizResult.length ? correctQuiz / formDataQuizResult.length : 0
  const dictationPercent = totalDictation ? correctDictation / totalDictation : 0

  const progressQuiz = quizPercent * 30
  const progressDictionary = dictationPercent * 70

  const progress = Math.round(progressQuiz + progressDictionary)

  const result: IListeningProgress = {
    progress: progress,
    point: correctDictation,
    totalQuestions: totalDictation,
    quizPoint: correctQuiz,
    quizTotal: formDataQuizResult.length,
    quizProgress: formDataQuizResult.length ? correctQuiz / formDataQuizResult.length * 100 : 0,
    time: 0,
    date: new Date(),
    result: formDataDictationResult,
    listeningId: listening,
  }
  if (currenPage === 'result') {
    return <ResultListening
      result={result}
      onRetry={onRetry}
    />
  }

  return null
}
