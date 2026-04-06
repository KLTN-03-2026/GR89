'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { SectionBlockSelector } from './SectionBlockSelector'
import { SectionContentFields } from './SectionContentFields'
import { SectionOverviewFields } from './SectionOverviewFields'
import type { LessonSection, SectionBlockKey, SectionBlockOption, SectionErrorState } from '../../types'

interface SectionEditorPanelProps {
  activeSection: LessonSection | null
  availableBlocks: SectionBlockOption[]
  activeSectionErrors: SectionErrorState
  onSave: () => void
  onUpdateSection: (patch: Partial<LessonSection>) => void
  onAddBlock: (blockKey: SectionBlockKey) => void
  onRemoveBlock: (blockKey: SectionBlockKey) => void
  sectionListInput: string
  setSectionListInput: Dispatch<SetStateAction<string>>
  sectionExamplesInput: string
  setSectionExamplesInput: Dispatch<SetStateAction<string>>
  sectionTableHeadersInput: string
  setSectionTableHeadersInput: Dispatch<SetStateAction<string>>
  sectionTableRowsInput: string
  setSectionTableRowsInput: Dispatch<SetStateAction<string>>
}

export function SectionEditorPanel({
  activeSection,
  availableBlocks,
  activeSectionErrors,
  onSave,
  onUpdateSection,
  onAddBlock,
  onRemoveBlock,
  sectionListInput,
  setSectionListInput,
  sectionExamplesInput,
  setSectionExamplesInput,
  sectionTableHeadersInput,
  setSectionTableHeadersInput,
  sectionTableRowsInput,
  setSectionTableRowsInput
}: SectionEditorPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Section editor</CardTitle>
            <CardDescription>Điền nội dung theo từng block để client render tự động.</CardDescription>
          </div>

          <Button type="button" onClick={onSave} disabled={!activeSection}>
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {!activeSection ? (
          <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center text-sm text-muted-foreground">
            Chưa chọn section. Hãy chọn một section ở cột bên trái để bắt đầu chỉnh sửa.
          </div>
        ) : (
          <>
            <SectionOverviewFields activeSection={activeSection} onUpdateSection={onUpdateSection} />

            <SectionBlockSelector availableBlocks={availableBlocks} onAddBlock={onAddBlock} />

            <SectionContentFields
              activeSection={activeSection}
              activeSectionErrors={activeSectionErrors}
              onUpdateSection={onUpdateSection}
              onRemoveBlock={onRemoveBlock}
              sectionListInput={sectionListInput}
              setSectionListInput={setSectionListInput}
              sectionExamplesInput={sectionExamplesInput}
              setSectionExamplesInput={setSectionExamplesInput}
              sectionTableHeadersInput={sectionTableHeadersInput}
              setSectionTableHeadersInput={setSectionTableHeadersInput}
              sectionTableRowsInput={sectionTableRowsInput}
              setSectionTableRowsInput={setSectionTableRowsInput}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

