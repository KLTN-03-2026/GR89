'use client'

import { useMemo, useState } from 'react'
import { FlowHeader } from './FlowHeader'
import { FlowProgress } from './FlowProgress'
import { PracticeStage } from './PracticeStage'
import { QuizStage } from './QuizStage'
import { ResultStage } from './ResultStage'
import { TheoryStage } from './TheoryStage'
import type { GrammarLessonFlowData, StudyStage, PracticeStatus } from '@/features/grammar/types'

interface GrammarLessonFlowProps {
  lesson: GrammarLessonFlowData
}

export function GrammarLessonFlow({ lesson }: GrammarLessonFlowProps) {
  const [flow, setFlow] = useState({
    stage: 'theory' as StudyStage,
    theoryIndex: 0,
    practiceIndex: 0,
    quizIndex: 0
  })

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [practiceStatus, setPracticeStatus] = useState<Record<string, PracticeStatus>>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})

  const totalTheory = lesson.sections.length
  const totalPractice = lesson.practice.length
  const totalQuiz = lesson.quizzes.length

  const currentTheory = lesson.sections[flow.theoryIndex]
  const currentPractice = lesson.practice[flow.practiceIndex]
  const currentQuiz = lesson.quizzes[flow.quizIndex]

  const score = useMemo(() => {
    return lesson.quizzes.reduce(
      (acc, q) => acc + (quizAnswers[q.id] === q.answer ? 1 : 0), 0
    )
  }, [quizAnswers, lesson.quizzes])

  const setPracticeAnswer = (questionId: string, value: string) => {
    setPracticeAnswers(prev => ({ ...prev, [questionId]: value }))
    setPracticeStatus(prev => ({ ...prev, [questionId]: 'idle' }))
  }

  const setQuizAnswer = (questionId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const goToPractice = () => {
    setFlow(prev => ({ ...prev, stage: 'practice', practiceIndex: 0 }))
  }

  const goToQuiz = () => {
    setFlow(prev => ({ ...prev, stage: 'quiz', quizIndex: 0 }))
  }

  const goToResult = () => {
    setFlow(prev => ({ ...prev, stage: 'result' }))
  }

  const goToTheory = () => {
    setFlow(prev => ({ ...prev, stage: 'theory', theoryIndex: 0 }))
  }

  const resetToPractice = () => {
    setFlow(prev => ({ ...prev, stage: 'practice', practiceIndex: 0 }))
    setPracticeAnswers({})
    setPracticeStatus({})
    setQuizAnswers({})
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-3 md:p-5">
      <FlowHeader title={lesson.title} stage={flow.stage} />

      <FlowProgress
        stage={flow.stage}
        theoryIndex={flow.theoryIndex}
        practiceIndex={flow.practiceIndex}
        quizIndex={flow.quizIndex}
        totalTheory={totalTheory}
        totalPractice={totalPractice}
        totalQuiz={totalQuiz}
      />

      <div>
        {flow.stage === 'theory' && currentTheory && (
          <TheoryStage
            section={currentTheory}
            index={flow.theoryIndex}
            total={totalTheory}
            onChangeIndex={(fn) =>
              setFlow(prev => ({
                ...prev,
                theoryIndex: fn(prev.theoryIndex)
              }))
            }
            onComplete={goToPractice}
          />
        )}

        {flow.stage === 'practice' && currentPractice && (
          <PracticeStage
            question={currentPractice}
            index={flow.practiceIndex}
            total={totalPractice}
            answer={practiceAnswers[currentPractice.id] || ''}
            status={practiceStatus[currentPractice.id] || 'idle'}
            onAnswerChange={(value) =>
              setPracticeAnswer(currentPractice.id, value)
            }
            onChangeIndex={(fn) =>
              setFlow(prev => ({
                ...prev,
                practiceIndex: fn(prev.practiceIndex)
              }))
            }
            onUpdateStatus={(status) =>
              setPracticeStatus(prev => ({
                ...prev,
                [currentPractice.id]: status
              }))
            }
            onComplete={goToQuiz}
          />
        )}

        {flow.stage === 'quiz' && currentQuiz && (
          <QuizStage
            question={currentQuiz}
            index={flow.quizIndex}
            total={totalQuiz}
            selectedAnswer={quizAnswers[currentQuiz.id] || ''}
            onSelect={(option) => setQuizAnswer(currentQuiz.id, option)}
            onChangeIndex={(fn) =>
              setFlow(prev => ({
                ...prev,
                quizIndex: fn(prev.quizIndex)
              }))
            }
            onComplete={goToResult}
          />
        )}

        {flow.stage === 'result' && (
          <ResultStage
            score={score}
            total={totalQuiz}
            onReviewTheory={goToTheory}
            onRetryPractice={resetToPractice}
          />
        )}
      </div>
    </div>
  )
}