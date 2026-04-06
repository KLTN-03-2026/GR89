'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { LessonSection } from '../../types'

interface SectionOverviewFieldsProps {
  activeSection: LessonSection
  onUpdateSection: (patch: Partial<LessonSection>) => void
}

export function SectionOverviewFields({ activeSection, onUpdateSection }: SectionOverviewFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-xl border p-4">
        <Label>Title</Label>
        <Input value={activeSection.title} onChange={(e) => onUpdateSection({ title: e.target.value })} placeholder="Nhập tiêu đề section" />
      </div>

      <div className="rounded-xl border bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tóm tắt section</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">Ví dụ: {activeSection.examples?.length || 0}</Badge>
          <Badge variant="secondary">List: {activeSection.list?.length || 0}</Badge>
          <Badge variant="secondary">Bảng: {activeSection.table ? 1 : 0}</Badge>
        </div>
      </div>
    </div>
  )
}

