'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react'

import { TabsContent } from '@/components/ui/tabs'
import { updateGrammarQuizzes } from '../../services/api'
import { toast } from 'react-toastify'

import { QuizEditorPanel } from './QuizEditorPanel'
import { QuizListPanel } from './QuizListPanel'
import type { GrammarLessonDraft, QuizQuestion } from '../../types'
import { createId, getOptionsTextareaError, getSelectedAnswerError, getSingleTextareaError } from './utils'

interface QuizTabProps {
  draft: GrammarLessonDraft
  setDraft: Dispatch<SetStateAction<GrammarLessonDraft>>
  activeQuizId: string
  setActiveQuizId: Dispatch<SetStateAction<string>>
  activeQuiz: QuizQuestion | null
  quizOptionsInput: string
  setQuizOptionsInput: Dispatch<SetStateAction<string>>
}

export function QuizTab({
  draft,
  setDraft,
  activeQuizId,
  setActiveQuizId,
  activeQuiz,
  quizOptionsInput,
  setQuizOptionsInput
}: QuizTabProps) {
  const hydratedQuizIdRef = useRef<string>('')

  useEffect(() => {
    if (!activeQuiz) {
      hydratedQuizIdRef.current = ''
      setQuizOptionsInput('')
      return
    }

    if (hydratedQuizIdRef.current === activeQuiz._id) return

    hydratedQuizIdRef.current = activeQuiz._id
    setQuizOptionsInput(activeQuiz.type === 'Multiple Choice' ? activeQuiz.options.join('\n') : '')
  }, [activeQuiz, setQuizOptionsInput])

  const activeQuizErrors = useMemo(() => {
    if (!activeQuiz) {
      return {
        question: '',
        options: '',
        answer: '',
        explanation: ''
      }
    }

    return {
      question: getSingleTextareaError(activeQuiz.question, 'Câu hỏi'),
      options: activeQuiz.type === 'Multiple Choice' ? getOptionsTextareaError(activeQuiz.options, 'Lựa chọn') : '',
      answer:
        activeQuiz.type === 'Multiple Choice'
          ? getSelectedAnswerError(activeQuiz.answer, activeQuiz.options, 'Đáp án')
          : getSingleTextareaError(activeQuiz.answer, 'Đáp án'),
      explanation: getSingleTextareaError(activeQuiz.explanation, 'Giải thích')
    }
  }, [activeQuiz])

  const updateQuiz = (patch: Partial<QuizQuestion>) => {
    if (!activeQuiz) return

    setDraft((prev) => ({
      ...prev,
      quizzes: prev.quizzes.map((quiz) => (quiz._id === activeQuiz._id ? { ...quiz, ...patch } : quiz))
    }))
  }

  const handleAddQuiz = () => {
    const id = createId('quiz')
    setDraft((prev) => ({
      ...prev,
      quizzes: [...prev.quizzes, { _id: id, question: 'Câu hỏi quiz mới', type: 'Multiple Choice', options: [], answer: '', explanation: '' }]
    }))
    setActiveQuizId(id)
  }

  const handleSaveQuizContent = async () => {
    if (!activeQuiz) return

    const hasQuizErrors = Object.values(activeQuizErrors).some(Boolean)
    if (hasQuizErrors) {
      toast.error('Vui lòng sửa các lỗi màu đỏ trước khi lưu')
      return
    }

    let normalizedQuiz = activeQuiz

    if (activeQuiz.type === 'Multiple Choice') {
      const options = quizOptionsInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      normalizedQuiz = {
        ...activeQuiz,
        options,
        answer: options.includes(activeQuiz.answer) ? activeQuiz.answer : ''
      }
    }

    const activeQuizIndex = draft.quizzes.findIndex((quiz) => quiz._id === activeQuiz._id)
    const nextQuizzes = draft.quizzes.map((quiz) => (quiz._id === activeQuiz._id ? (normalizedQuiz as QuizQuestion) : quiz))

    const response = await updateGrammarQuizzes(draft._id, nextQuizzes)
    const savedQuizzes = response.data?.quizzes || nextQuizzes
    setDraft((prev) => ({
      ...prev,
      quizzes: savedQuizzes
    }))
    if (activeQuizIndex >= 0 && savedQuizzes[activeQuizIndex]?._id) {
      setActiveQuizId(savedQuizzes[activeQuizIndex]._id)
    }

    toast.success('Đã lưu quiz')
  }

  const handleChangeQuizType = (value: QuizQuestion['type']) => {
    if (!activeQuiz) return

    if (value === 'Multiple Choice') {
      setQuizOptionsInput(activeQuiz.options.join('\n'))
      updateQuiz({
        type: value,
        options: activeQuiz.type === 'Multiple Choice' ? activeQuiz.options : [],
        answer: activeQuiz.type === 'Multiple Choice' ? activeQuiz.answer : ''
      })
      return
    }

    setQuizOptionsInput('')
    updateQuiz({
      type: value,
      options: [],
      answer: ''
    })
  }

  const handleChangeQuizOptionsInput = (value: string) => {
    setQuizOptionsInput(value)
    const options = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    updateQuiz({
      options,
      answer: options.includes(activeQuiz?.answer || '') ? activeQuiz?.answer || '' : ''
    })
  }

  return (
    <TabsContent value="quiz" className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <QuizListPanel
        quizzes={draft.quizzes}
        activeQuizId={activeQuizId}
        onSelectQuiz={setActiveQuizId}
        onAddQuiz={handleAddQuiz}
      />

      <QuizEditorPanel
        activeQuiz={activeQuiz}
        activeQuizErrors={activeQuizErrors}
        quizOptionsInput={quizOptionsInput}
        onSave={handleSaveQuizContent}
        onUpdateQuiz={updateQuiz}
        onChangeQuizType={handleChangeQuizType}
        onChangeQuizOptionsInput={handleChangeQuizOptionsInput}
      />
    </TabsContent>
  )
}

