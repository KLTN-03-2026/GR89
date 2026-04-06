'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { PracticeQuestion } from '../../types'
import { getPracticeTypeLabel } from './utils'

interface PracticeListPanelProps {
  practiceItems: PracticeQuestion[]
  activePracticeIndex: number
  onSelectPractice: (index: number) => void
  onAddPractice: () => void
}

export function PracticeListPanel({ practiceItems, activePracticeIndex, onSelectPractice, onAddPractice }: PracticeListPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Luyện tập</CardTitle>
        <CardDescription>Quản lý danh sách câu luyện tập theo từng bước.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {practiceItems.map((item, index) => (
          <button
            key={item.id}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${index === activePracticeIndex
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            onClick={() => onSelectPractice(index)}
            type="button"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bài {index + 1}</p>
            <p className="mt-1 font-medium text-slate-900">{getPracticeTypeLabel(item.type)}</p>
          </button>
        ))}

        <Button type="button" className="w-full rounded-xl" variant="secondary" onClick={onAddPractice}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu luyện tập
        </Button>
      </CardContent>
    </Card>
  )
}

