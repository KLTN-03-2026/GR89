'use client'

import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import { TabsContent } from '@/components/ui/tabs'
import { updateGrammarPractice } from '../../services/api'
import { toast } from 'react-toastify'

import { PracticeEditorPanel } from './PracticeEditorPanel'
import { PracticeListPanel } from './PracticeListPanel'
import type { GrammarLessonDraft, PracticeQuestion } from '../../types'
import { createId, getOptionsTextareaError, getSingleTextareaError } from './utils'

interface PracticeTabProps {
  draft: GrammarLessonDraft
  setDraft: Dispatch<SetStateAction<GrammarLessonDraft>>
  activePracticeIndex: number
  setActivePracticeIndex: Dispatch<SetStateAction<number>>
  activePractice: PracticeQuestion | null
  practiceOptionsInput: string
  setPracticeOptionsInput: Dispatch<SetStateAction<string>>
}

export function PracticeTab({
  draft,
  setDraft,
  activePracticeIndex,
  setActivePracticeIndex,
  activePractice,
  practiceOptionsInput,
  setPracticeOptionsInput
}: PracticeTabProps) {
  useEffect(() => {
    if (!activePractice) {
      setPracticeOptionsInput('')
      return
    }

    setPracticeOptionsInput(activePractice.type === 'multiple_choice' ? activePractice.options.join('\n') : '')
  }, [activePractice, setPracticeOptionsInput])

  const activePracticeErrors = useMemo(() => {
    if (!activePractice) {
      return {
        question: '',
        options: ''
      }
    }

    return {
      question: getSingleTextareaError(activePractice.question, 'Câu hỏi'),
      options: activePractice.type === 'multiple_choice' ? getOptionsTextareaError(activePractice.options, 'Lựa chọn') : ''
    }
  }, [activePractice])

  const updatePractice = (patch: Partial<PracticeQuestion>) => {
    if (!activePractice) return

    setDraft((prev) => ({
      ...prev,
      practice: prev.practice.map((practice) =>
        practice.id === activePractice.id ? ({ ...practice, ...patch } as PracticeQuestion) : practice
      )
    }))
  }

  const handleAddPractice = () => {
    const id = createId('practice')
    const next: PracticeQuestion = {
      id,
      type: 'fill_blank',
      question: 'Câu hỏi mới',
      answer: '',
      hint: ''
    }

    setDraft((prev) => ({ ...prev, practice: [...prev.practice, next] }))
    setActivePracticeIndex(draft.practice.length)
  }

  const handleSavePracticeContent = async () => {
    if (!activePractice) return

    const hasPracticeErrors = Object.values(activePracticeErrors).some(Boolean)
    if (hasPracticeErrors) {
      toast.error('Vui lòng sửa các lỗi màu đỏ trước khi lưu')
      return
    }

    let normalizedPractice = activePractice

    if (activePractice.type === 'multiple_choice') {
      const options = practiceOptionsInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      normalizedPractice = { ...activePractice, options }
    }

    const nextPractice = draft.practice.map((practice, index) =>
      index === activePracticeIndex ? (normalizedPractice as PracticeQuestion) : practice
    )

    const response = await updateGrammarPractice(draft._id, nextPractice)
    setDraft((prev) => ({
      ...prev,
      practice: response.data?.practice || nextPractice
    }))

    toast.success('Đã lưu câu luyện tập')
  }

  const handleChangePracticeType = (nextType: PracticeQuestion['type']) => {
    if (!activePractice) return

    if (nextType === 'multiple_choice') {
      setPracticeOptionsInput(activePractice.type === 'multiple_choice' ? activePractice.options.join('\n') : '')
      updatePractice({ type: nextType, options: activePractice.type === 'multiple_choice' ? activePractice.options : [] })
      return
    }

    if (nextType === 'correct_sentence') {
      setPracticeOptionsInput('')
      updatePractice({
        type: nextType,
        wrongSentence: activePractice.type === 'correct_sentence' ? activePractice.wrongSentence : ''
      })
      return
    }

    setPracticeOptionsInput('')
    updatePractice({ type: 'fill_blank' })
  }

  const handleChangePracticeOptionsInput = (value: string) => {
    setPracticeOptionsInput(value)
    const options = value.split('\n').map((line) => line.trim()).filter(Boolean)
    updatePractice({ options })
  }

  return (
    <TabsContent value="practice" className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <PracticeListPanel
        practiceItems={draft.practice}
        activePracticeIndex={activePracticeIndex}
        onSelectPractice={setActivePracticeIndex}
        onAddPractice={handleAddPractice}
      />

      <PracticeEditorPanel
        activePractice={activePractice}
        activePracticeErrors={activePracticeErrors}
        practiceOptionsInput={practiceOptionsInput}
        onSave={handleSavePracticeContent}
        onUpdatePractice={updatePractice}
        onChangePracticeType={handleChangePracticeType}
        onChangePracticeOptionsInput={handleChangePracticeOptionsInput}
      />
    </TabsContent>
  )
}

