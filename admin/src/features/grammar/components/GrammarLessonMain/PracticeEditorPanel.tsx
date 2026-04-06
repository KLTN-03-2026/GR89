'use client'

import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { PracticeFormFields } from './PracticeFormFields'
import type { PracticeErrorState, PracticeQuestion } from '../../types'

interface PracticeEditorPanelProps {
  activePractice: PracticeQuestion | null
  activePracticeErrors: PracticeErrorState
  practiceOptionsInput: string
  onSave: () => void
  onUpdatePractice: (patch: Partial<PracticeQuestion>) => void
  onChangePracticeType: (nextType: PracticeQuestion['type']) => void
  onChangePracticeOptionsInput: (value: string) => void
}

export function PracticeEditorPanel({
  activePractice,
  activePracticeErrors,
  practiceOptionsInput,
  onSave,
  onUpdatePractice,
  onChangePracticeType,
  onChangePracticeOptionsInput
}: PracticeEditorPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle>Practice editor</CardTitle>
          <Button type="button" onClick={onSave} disabled={!activePractice}>
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!activePractice ? (
          <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center text-sm text-muted-foreground">
            Chưa chọn câu luyện tập.
          </div>
        ) : (
          <PracticeFormFields
            activePractice={activePractice}
            activePracticeErrors={activePracticeErrors}
            practiceOptionsInput={practiceOptionsInput}
            onUpdatePractice={onUpdatePractice}
            onChangePracticeType={onChangePracticeType}
            onChangePracticeOptionsInput={onChangePracticeOptionsInput}
          />
        )}
      </CardContent>
    </Card>
  )
}

