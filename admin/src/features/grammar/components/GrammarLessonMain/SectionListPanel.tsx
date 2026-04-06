'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { LessonSection } from '../../types'

interface SectionListPanelProps {
  sections: LessonSection[]
  activeSectionIndex: number
  onSelectSection: (index: number) => void
  onMoveSectionUp: (index: number) => void
  onMoveSectionDown: (index: number) => void
  onDeleteSection: (index: number) => void
  onAddSection: () => void
}

export function SectionListPanel({
  sections,
  activeSectionIndex,
  onSelectSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onAddSection
}: SectionListPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Danh sách section</CardTitle>
        <CardDescription>Chọn section để chỉnh nội dung hiển thị.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`rounded-xl border p-3 transition ${index === activeSectionIndex
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelectSection(index)}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Section {index + 1}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-900">{section.title || 'Untitled section'}</p>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={() => onMoveSectionUp(index)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  onClick={() => onMoveSectionDown(index)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Button type="button" size="icon" variant="destructive" className="h-8 w-8 rounded-lg" onClick={() => onDeleteSection(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" className="w-full rounded-xl" variant="secondary" onClick={onAddSection}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm section
        </Button>
      </CardContent>
    </Card>
  )
}

