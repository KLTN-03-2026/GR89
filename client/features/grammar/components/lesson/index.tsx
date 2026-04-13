'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FlowHeader } from './FlowHeader'
import { FlowProgress } from './FlowProgress'
import { PracticeStage } from './PracticeStage'
import { TheoryStage } from './TheoryStage'
import type { GrammarLessonFlowData, StudyStage, PracticeStatus } from '@/features/grammar/types'

interface GrammarLessonFlowProps {
  lesson: GrammarLessonFlowData
  topicId: string
}

export function GrammarLessonFlow({ lesson, topicId }: GrammarLessonFlowProps) {
  const router = useRouter()
  const [flow, setFlow] = useState({
    stage: 'theory' as StudyStage,
    theoryIndex: 0,
    practiceIndex: 0,
  })

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [practiceStatus, setPracticeStatus] = useState<Record<string, PracticeStatus>>({})

  const totalTheory = lesson.sections.length
  const totalPractice = lesson.practice.length

  const currentTheory = lesson.sections[flow.theoryIndex]
  const currentPractice = lesson.practice[flow.practiceIndex]

  const setPracticeAnswer = (questionId: string, value: string) => {
    setPracticeAnswers((prev) => ({ ...prev, [questionId]: value }))
    setPracticeStatus((prev) => ({ ...prev, [questionId]: 'idle' }))
  }

  const goToPractice = () => {
    setFlow((prev) => ({ ...prev, stage: 'practice', practiceIndex: 0 }))
  }

  /** Chuyển sang trang quiz chung (cùng UI với vocabulary/reading). */
  const goToSharedQuiz = () => {
    router.push(`/quizz/${topicId}?type=grammar`)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-3 md:p-5">
      <FlowHeader title={lesson.title} stage={flow.stage} />

      <FlowProgress
        stage={flow.stage}
        theoryIndex={flow.theoryIndex}
        practiceIndex={flow.practiceIndex}
        totalTheory={totalTheory}
        totalPractice={totalPractice}
      />

      <div>
        {flow.stage === 'theory' && currentTheory && (
          <TheoryStage
            section={currentTheory}
            index={flow.theoryIndex}
            total={totalTheory}
            onChangeIndex={(fn) =>
              setFlow((prev) => ({
                ...prev,
                theoryIndex: fn(prev.theoryIndex),
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
            onAnswerChange={(value) => setPracticeAnswer(currentPractice.id, value)}
            onChangeIndex={(fn) =>
              setFlow((prev) => ({
                ...prev,
                practiceIndex: fn(prev.practiceIndex),
              }))
            }
            onUpdateStatus={(status) =>
              setPracticeStatus((prev) => ({
                ...prev,
                [currentPractice.id]: status,
              }))
            }
            onComplete={goToSharedQuiz}
          />
        )}
      </div>
    </div>
  )
}
