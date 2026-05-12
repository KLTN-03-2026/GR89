'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { PracticeQuestion } from '../../types'
import { getPracticeTypeLabel } from './utils'

interface PracticeListPanelProps {
  practiceItems: PracticeQuestion[]
  activePracticeIndex: number
  onSelectPractice: (index: number) => void
  onMovePracticeUp: (index: number) => void
  onMovePracticeDown: (index: number) => void
  onDeletePractice: (index: number) => void
  onAddPractice: () => void
}

export function PracticeListPanel({
  practiceItems,
  activePracticeIndex,
  onSelectPractice,
  onMovePracticeUp,
  onMovePracticeDown,
  onDeletePractice,
  onAddPractice
}: PracticeListPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Luyện tập</CardTitle>
        <CardDescription>Quản lý danh sách câu luyện tập theo từng bước.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {practiceItems.map((item, index) => (
          <div
            key={item.id}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${index === activePracticeIndex
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelectPractice(index)}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bài {index + 1}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-900">{getPracticeTypeLabel(item.type)}</p>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMovePracticeUp(index)
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMovePracticeDown(index)
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeletePractice(index)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" className="w-full rounded-xl" variant="secondary" onClick={onAddPractice}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu luyện tập
        </Button>
      </CardContent>
    </Card>
  )
}
