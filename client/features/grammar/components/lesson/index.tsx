'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FlowHeader } from './FlowHeader'
import { FlowProgress } from './FlowProgress'
import { PracticeStage } from './PracticeStage'
import { TheoryStage } from './TheoryStage'
import type { GrammarLessonFlowData, StudyStage, PracticeStatus } from '@/features/grammar/types'

interface GrammarLessonFlowProps {
  lesson: GrammarLessonFlowData
  topicId: string
}

interface IFlow {
  stage: StudyStage
  theoryIndex: number
  practiceIndex: number
}

export function GrammarLessonFlow({ lesson, topicId }: GrammarLessonFlowProps) {
  const router = useRouter()
  const LOCAL_STORAGE_KEY = `grammar_progress_${topicId}`

  // 1. Khởi tạo state với hàm callback để chỉ đọc từ localStorage 1 lần khi mount
  const [flow, setFlow] = useState<IFlow>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed.flow || { stage: 'theory', theoryIndex: 0, practiceIndex: 0 }
        } catch (e) {
          console.error("Error parsing saved progress", e)
        }
      }
    }
    return { stage: 'theory' as StudyStage, theoryIndex: 0, practiceIndex: 0 }
  })

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved).practiceAnswers || {}
        } catch (e) { }
      }
    }
    return {}
  })

  const [practiceStatus, setPracticeStatus] = useState<Record<string, PracticeStatus>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved).practiceStatus || {}
        } catch (e) { }
      }
    }
    return {}
  })

  // 2. Tự động lưu tiến độ vào localStorage mỗi khi state thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saveData = {
        flow,
        practiceAnswers,
        practiceStatus
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData))
    }
  }, [flow, practiceAnswers, practiceStatus, LOCAL_STORAGE_KEY])

  const totalTheory = lesson.sections.length
  const totalPractice = lesson.practice.length

  const currentTheory = lesson.sections[flow.theoryIndex]
  const currentPractice = lesson.practice[flow.practiceIndex]

  const setPracticeAnswer = (questionId: string, value: string) => {
    setPracticeAnswers((prev) => ({ ...prev, [questionId]: value }))
    setPracticeStatus((prev) => ({ ...prev, [questionId]: 'idle' }))
  }

  const goToPractice = () => {
    setFlow((prev: IFlow) => ({ ...prev, stage: 'practice', practiceIndex: 0 }))
  }

  /** Chuyển sang trang quiz chung và xóa dữ liệu cache (nếu muốn). */
  const goToSharedQuiz = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY) // Xóa progress khi hoàn thành để lần sau học lại từ đầu
    }
    router.push(`/quizz/${topicId}?type=grammar`)
  }

  const setStage = (stage: StudyStage) => {
    if (stage === 'practice' || stage === 'theory') {
      setFlow((prev: IFlow) => ({ ...prev, stage }))
    }
    else {
      router.push(`/quizz/${topicId}?type=grammar`)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-3 md:p-5">
      <FlowHeader title={lesson.title} stage={flow.stage} />

      <FlowProgress
        stage={flow.stage}
        setStage={setStage}
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
