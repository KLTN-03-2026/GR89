'use client'

import type { Dispatch, SetStateAction } from 'react'
import { FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { LessonSection, SectionBlockKey, SectionErrorState } from '../../types'

interface SectionContentFieldsProps {
  activeSection: LessonSection
  activeSectionErrors: SectionErrorState
  onUpdateSection: (patch: Partial<LessonSection>) => void
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

export function SectionContentFields({
  activeSection,
  activeSectionErrors,
  onUpdateSection,
  onRemoveBlock,
  sectionListInput,
  setSectionListInput,
  sectionExamplesInput,
  setSectionExamplesInput,
  sectionTableHeadersInput,
  setSectionTableHeadersInput,
  sectionTableRowsInput,
  setSectionTableRowsInput
}: SectionContentFieldsProps) {
  return (
    <>
      {activeSection.description !== undefined && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>Mô tả</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('description')}>
              Bỏ block
            </Button>
          </div>

          <Textarea
            value={activeSection.description || ''}
            onChange={(e) => onUpdateSection({ description: e.target.value })}
            rows={4}
            placeholder="Nhập phần mô tả cho section"
            className="[overflow-wrap:anywhere]"
          />

          {activeSectionErrors.description ? <p className="text-xs text-rose-600">{activeSectionErrors.description}</p> : null}
        </div>
      )}

      {activeSection.note !== undefined && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>Lưu ý</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('note')}>
              Bỏ block
            </Button>
          </div>

          <Textarea
            value={activeSection.note || ''}
            onChange={(e) => onUpdateSection({ note: e.target.value })}
            rows={4}
            placeholder="Nhập lưu ý quan trọng"
            className="[overflow-wrap:anywhere]"
          />

          {activeSectionErrors.note ? <p className="text-xs text-rose-600">{activeSectionErrors.note}</p> : null}
        </div>
      )}

      {activeSection.formula !== undefined && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>Công thức</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('formula')}>
              Bỏ block
            </Button>
          </div>

          <Textarea
            value={activeSection.formula || ''}
            onChange={(e) => onUpdateSection({ formula: e.target.value })}
            rows={4}
            placeholder="Ví dụ: S + V(s/es) + O"
            className="[overflow-wrap:anywhere]"
          />

          {activeSectionErrors.formula ? <p className="text-xs text-rose-600">{activeSectionErrors.formula}</p> : null}
        </div>
      )}

      {activeSection.list !== undefined && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>Danh sách (mỗi dòng 1 item)</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('list')}>
              Bỏ block
            </Button>
          </div>

          <Textarea
            value={sectionListInput}
            onChange={(e) => setSectionListInput(e.target.value)}
            rows={5}
            placeholder={'Mỗi dòng là một ý\nVí dụ:\nDùng cho thói quen\nDùng cho sự thật hiển nhiên'}
            className="[overflow-wrap:anywhere]"
          />

          {activeSectionErrors.list ? <p className="text-xs text-rose-600">{activeSectionErrors.list}</p> : null}
        </div>
      )}

      {activeSection.examples !== undefined && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>Ví dụ (format: english | vietnamese, mỗi dòng 1 ví dụ)</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('examples')}>
              Bỏ block
            </Button>
          </div>

          <Textarea
            value={sectionExamplesInput}
            onChange={(e) => setSectionExamplesInput(e.target.value)}
            rows={5}
            placeholder={'Ví dụ:\nI go to school every day. | Tôi đi học mỗi ngày.'}
            className="[overflow-wrap:anywhere]"
          />

          <p className="text-xs text-slate-500">Nhập tự nhiên từng dòng, rồi bấm `Lưu` để kiểm tra định dạng `English | Vietnamese`.</p>
          {activeSectionErrors.examples ? <p className="text-xs text-rose-600">{activeSectionErrors.examples}</p> : null}
        </div>
      )}

      {activeSection.table !== undefined && (
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <Label>Bảng dữ liệu</Label>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveBlock('table')}>
              Bỏ block
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Table headers (phân cách bằng |)</Label>
            <Input
              value={sectionTableHeadersInput}
              onChange={(e) => setSectionTableHeadersInput(e.target.value)}
              placeholder="Ví dụ: Loại | Cấu trúc | Ví dụ"
            />
            <p className="text-xs text-slate-500">Nhập bình thường, ví dụ: `Loại | Cấu trúc | Ví dụ`. Hệ thống sẽ kiểm tra khi bấm `Lưu`.</p>
            {activeSectionErrors.tableHeaders ? <p className="text-xs text-rose-600">{activeSectionErrors.tableHeaders}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Table rows (mỗi dòng 1 row, mỗi cell ngăn cách bằng |)</Label>
            <Textarea
              value={sectionTableRowsInput}
              onChange={(e) => setSectionTableRowsInput(e.target.value)}
              rows={5}
              placeholder={'Ví dụ:\nKhẳng định | S + V(s/es) | She goes to school'}
              className="[overflow-wrap:anywhere]"
            />
            <p className="text-xs text-slate-500">Nhập từng dòng bình thường, sau đó bấm `Lưu` để kiểm tra số cột của từng row theo header.</p>
            {activeSectionErrors.tableRows ? <p className="text-xs text-rose-600">{activeSectionErrors.tableRows}</p> : null}
          </div>
        </div>
      )}
    </>
  )
}

