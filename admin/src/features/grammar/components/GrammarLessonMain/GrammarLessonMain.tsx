'use client'

import { useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GrammarLessonHeader } from './GrammarLessonHeader'
import { PracticeTab } from './PracticeTab'
import { QuizTab } from './QuizTab'
import { SectionsTab } from './SectionsTab'
import type { GrammarLessonDraft } from '../../types'
import { Quiz } from '@/types'

interface GrammarLessonMainProps {
  topic: GrammarLessonDraft
}

export function GrammarLessonMain({ topic }: GrammarLessonMainProps) {
  const [draft, setDraft] = useState<GrammarLessonDraft>(topic)

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0)
  const [activePracticeIndex, setActivePracticeIndex] = useState<number>(0)
  const [activeQuizId, setActiveQuizId] = useState<Quiz['_id']>(topic.quizzes.length > 0 ? topic.quizzes[0]._id : '')

  const [practiceOptionsInput, setPracticeOptionsInput] = useState('')
  const [quizOptionsInput, setQuizOptionsInput] = useState('')

  return (
    <div className="space-y-6">
      <GrammarLessonHeader
        topicId={topic?._id}
        title={topic?.title || ''}
        description={topic?.description || ''}
        sectionsCount={draft?.sections.length || 0}
        practiceCount={draft?.practice.length || 0}
        quizCount={draft?.quizzes.length || 0}
      />

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="sections" className="rounded-lg py-2.5">
            Lý thuyết
          </TabsTrigger>
          <TabsTrigger value="practice" className="rounded-lg py-2.5">
            Luyện tập
          </TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-lg py-2.5">
            Quiz
          </TabsTrigger>
        </TabsList>

        <SectionsTab
          draft={draft}
          setDraft={setDraft}
          activeSectionIndex={activeSectionIndex}
          setActiveSectionIndex={setActiveSectionIndex}
          activeSection={draft?.sections.length > 0 ? draft?.sections[activeSectionIndex] : null}
        />

        <PracticeTab
          draft={draft}
          setDraft={setDraft}
          activePracticeIndex={activePracticeIndex}
          setActivePracticeIndex={setActivePracticeIndex}
          activePractice={draft?.practice.length > 0 ? draft?.practice[activePracticeIndex] : null}
          practiceOptionsInput={practiceOptionsInput}
          setPracticeOptionsInput={setPracticeOptionsInput}
        />

        <QuizTab
          draft={draft}
          setDraft={setDraft}
          activeQuizId={activeQuizId}
          setActiveQuizId={setActiveQuizId}
          activeQuiz={draft?.quizzes.find((quiz) => quiz._id === activeQuizId) || null}
          quizOptionsInput={quizOptionsInput}
          setQuizOptionsInput={setQuizOptionsInput}
        />
      </Tabs>
    </div>
  )
}

